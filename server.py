"""Local preview: catalogue, guest carts and delivery review. PayU submission is gated."""
import argparse
import json
import re
import secrets
import os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import parse_qsl, urlencode, urlsplit
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parent
STORE_URL = os.environ.get("AARTYZ_STORE_URL", "https://aartyz.in").rstrip("/")
STORE_API = STORE_URL + "/wp-json/wc/store/v1/"
CHECKOUT_ENABLED = os.environ.get("AARTYZ_CHECKOUT_ENABLED") == "1"
ALLOWED_QUERY = {"per_page", "page", "orderby", "order", "_fields", "type", "parent", "slug"}
STOREFRONT_PAGES = {
    "/visit", "/corporate-gifting", "/gift-accessories", "/bulk-quote", "/made-to-order",
    "/shopping-help", "/from-instagram", "/about-us", "/eco-printing",
    "/edits/hand-block-printed-sarees", "/edits/hand-painted-sarees", "/edits/diwali-26",
}
PRODUCT_PATH = re.compile(r"/(?:product/[a-zA-Z0-9%-]{1,200}|products/[1-9][0-9]{0,9})/?")

CART_ACTIONS = {"add-item", "update-item", "remove-item", "apply-coupon", "remove-coupon", "update-customer", "select-shipping-rate"}

ADDRESS_FIELDS = {"first_name", "last_name", "address_1", "address_2", "city", "state", "postcode", "country", "email", "phone"}


def valid_address(address, billing=False):
    if not isinstance(address, dict) or set(address) - ADDRESS_FIELDS:
        return False
    if not all(isinstance(value, str) and len(value) <= 250 for value in address.values()):
        return False
    if not all(address.get(key, "").strip() for key in ("first_name", "last_name", "address_1", "city", "state")):
        return False
    if address.get("country") != "IN" or not re.fullmatch(r"[1-9][0-9]{5}", address.get("postcode", "")):
        return False
    return not billing or bool(re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", address.get("email", "")) and
                               re.fullmatch(r"[+0-9 ()-]{8,20}", address.get("phone", "")))


def valid_checkout(body):
    return isinstance(body, dict) and set(body) == {"billing_address", "shipping_address", "payment_method", "expected_total"} and \
        valid_address(body["billing_address"], True) and valid_address(body["shipping_address"]) and \
        body["payment_method"] == "payubiz" and isinstance(body["expected_total"], str) and \
        bool(re.fullmatch(r"[0-9]{1,12}", body["expected_total"]))


def validate_cart_body(action, body):
    if not isinstance(body, dict):
        return False
    if action == "update-customer":
        return set(body) == {"billing_address", "shipping_address"} and valid_address(body["billing_address"], True) and valid_address(body["shipping_address"])
    if action == "select-shipping-rate":
        return set(body) == {"package_id", "rate_id"} and type(body["package_id"]) is int and body["package_id"] >= 0 and \
            isinstance(body["rate_id"], str) and bool(re.fullmatch(r"[A-Za-z0-9_:.-]{1,150}", body["rate_id"]))
    fields = {"add-item": {"id", "quantity", "variation"}, "update-item": {"key", "quantity"},
              "remove-item": {"key"}, "apply-coupon": {"code"}, "remove-coupon": {"code"}}[action]
    if set(body) - fields:
        return False
    if action == "add-item" and (type(body.get("id")) is not int or body["id"] <= 0):
        return False
    if action in {"add-item", "update-item"}:
        if type(body.get("quantity")) is not int or not 1 <= body["quantity"] <= 9999:
            return False
    if action in {"update-item", "remove-item"}:
        if not isinstance(body.get("key"), str) or not re.fullmatch(r"[a-zA-Z0-9_-]{1,128}", body["key"]):
            return False
    if "coupon" in action:
        if not isinstance(body.get("code"), str) or not 1 <= len(body["code"].strip()) <= 100:
            return False
    if "variation" in body:
        if not isinstance(body["variation"], list) or len(body["variation"]) > 20:
            return False
        for attribute in body["variation"]:
            if not isinstance(attribute, dict) or set(attribute) != {"attribute", "value"}:
                return False
            if not all(isinstance(value, str) and 0 < len(value) <= 200 for value in attribute.values()):
                return False
    return True


class StorefrontHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self):
        url = urlsplit(self.path)
        if url.path == "/api/store/config":
            self.json_response(200, {"checkout_enabled": CHECKOUT_ENABLED, "store_url": STORE_URL})
            return
        if url.path == "/api/store/cart":
            if self.same_origin():
                self.proxy_cart()
            return
        if url.path.startswith("/api/catalog/"):
            resource = url.path.removeprefix("/api/catalog/")
            single = bool(re.fullmatch(r"products/[1-9][0-9]{0,9}", resource))
            if not single and resource not in {"products", "products/categories"}:
                self.send_error(404)
                return
            query = urlencode([(k, v) for k, v in parse_qsl(url.query) if k in ALLOWED_QUERY])
            request = Request(STORE_API + resource + "?" + query,
                              headers={"Accept": "application/json", "User-Agent": "Aartyz-Catalogue-Preview/1.0"})
            try:
                # No browser cookies, admin keys, or private customer data are forwarded.
                with urlopen(request, timeout=25) as response:
                    body = response.read()
                    payload = json.loads(body)
                    if not isinstance(payload, dict if single else list) or (single and str(payload.get("id")) != resource.split("/")[-1]):
                        raise ValueError("Unexpected catalogue response")
                    self.send_response(200)
                    self.send_header("Content-Type", "application/json; charset=utf-8")
                    self.send_header("Cache-Control", "no-store")
                    for header in ("X-WP-Total", "X-WP-TotalPages"):
                        if response.headers.get(header):
                            self.send_header(header, response.headers[header])
                    self.end_headers()
                    self.wfile.write(body)
            except HTTPError as error:
                status = 404 if single and error.code == 404 else 502
                self.json_response(status, {"error": "Product not found." if status == 404 else "The WooCommerce catalogue is temporarily unavailable."})
            except (URLError, TimeoutError, ValueError, OSError):
                self.send_response(502)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(b'{"error":"The WooCommerce catalogue is temporarily unavailable."}')
            return
        if url.path.rstrip("/") == "/gift-accessories":
            self.send_response(308)
            self.send_header("Location", "/corporate-gifting/" + ("?" + url.query if url.query else ""))
            self.end_headers()
            return
        if url.path.rstrip("/") in STOREFRONT_PAGES or PRODUCT_PATH.fullmatch(url.path):
            self.path = "/index.html"
            super().do_GET()
            return
        # Serve only preview assets, never the repository or environment directories.
        if url.path not in {"/", "/index.html", "/style.css", "/script.js", "/woo-catalog.js", "/woo-cart.js", "/woo-checkout.js", "/product-placeholder.svg", "/assets/aartyz-logo.png", "/assets/workshop-eco.jpg", "/assets/workshop-artisan.jpg", "/assets/workshop-founder.jpg", "/assets/banner-indian-craft.jpg", "/assets/banner-slow-made.jpg", "/assets/banner-block-print-sarees.jpg", "/assets/banner-handpainted-sarees.jpg", "/assets/banner-new-arrivals.jpg"}:
            self.send_error(404)
            return
        super().do_GET()

    def json_response(self, status, data, token=None):
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "private, no-store")
        self.send_header("Vary", "Cart-Token")
        if token:
            self.send_header("Cart-Token", token)
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

    def same_origin(self):
        origin = self.headers.get("Origin")
        if self.headers.get("Sec-Fetch-Site") == "cross-site" or (
                origin and origin != "http://" + self.headers.get("Host", "")):
            self.json_response(403, {"message": "Cross-origin cart requests are not allowed."})
            return False
        return True

    def do_POST(self):
        url = urlsplit(self.path)
        checkout = url.path == "/api/store/checkout" and not url.query
        if checkout and not CHECKOUT_ENABLED:
            self.json_response(503, {"message": "Payment submission is disabled until the PayU test integration has been verified."})
            return
        action = url.path.removeprefix("/api/store/cart/")
        if not checkout and (not url.path.startswith("/api/store/cart/") or action not in CART_ACTIONS or url.query):
            self.json_response(404, {"message": "This preview does not expose that operation."})
            return
        if not self.same_origin():
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if not 0 < length <= 8192 or self.headers.get_content_type() != "application/json":
                raise ValueError()
            body = json.loads(self.rfile.read(length))
            if not (valid_checkout(body) if checkout else validate_cart_body(action, body)):
                raise ValueError()
        except (ValueError, TypeError):
            self.json_response(400, {"message": "Invalid cart request."})
            return
        if not self.headers.get("Cart-Token"):
            self.json_response(401, {"message": "Load your guest cart before making changes."})
            return
        self.proxy_cart(action, body, checkout=checkout)

    def proxy_cart(self, action="", body=None, checkout=False):
        token = self.headers.get("Cart-Token", "")
        if token and (len(token) > 4096 or not re.fullmatch(r"[A-Za-z0-9._-]+", token)):
            self.json_response(400, {"message": "Invalid guest cart session."})
            return
        headers = {"Accept": "application/json", "User-Agent": "Aartyz-Cart-Preview/1.0",
                   "Cache-Control": "no-cache, no-store", "Pragma": "no-cache"}
        if token:
            headers["Cart-Token"] = token
        if body is not None:
            headers["Content-Type"] = "application/json"
        # Some hosting/CDN caches ignore Cart-Token. A unique query prevents a cached
        # anonymous token or another visitor's cart from being returned upstream.
        cart_url = STORE_API + ("checkout" if checkout else "cart" + ("/" + action if action else ""))
        cart_url += "?_aartyz_request=" + secrets.token_urlsafe(18)
        request = Request(cart_url, headers=headers,
                          data=json.dumps(body).encode() if body is not None else None)
        try:
            # Forward only this visitor's Cart-Token. Never admin/browser cookies.
            with urlopen(request, timeout=25) as response:
                self.json_response(200, json.load(response), response.headers.get("Cart-Token"))
        except HTTPError as error:
            try:
                data = json.load(error)
            except (ValueError, OSError):
                data = {"message": "WooCommerce could not process this cart request."}
            self.json_response(error.code, data)
        except (URLError, TimeoutError, ValueError, OSError):
            self.json_response(502, {"message": "The store is temporarily unavailable. Reload your cart before trying again."})


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=8765)
    args = parser.parse_args()
    print(f"Aartyz preview: http://localhost:{args.port}", flush=True)
    ThreadingHTTPServer(("127.0.0.1", args.port), StorefrontHandler).serve_forever()
