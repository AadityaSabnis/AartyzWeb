"""Boundary tests use a mocked upstream; no real carts or orders are created."""
import io
import json
import sys
import threading
import unittest
from pathlib import Path
from unittest.mock import patch
from urllib.error import HTTPError
from urllib.request import Request, urlopen

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from server import StorefrontHandler, ThreadingHTTPServer, validate_cart_body, valid_checkout


class Upstream(io.BytesIO):
    headers = {"Cart-Token": "isolated.response"}


class ProxyTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = ThreadingHTTPServer(("127.0.0.1", 0), StorefrontHandler)
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()
        cls.base = f"http://127.0.0.1:{cls.server.server_port}"

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()
        cls.thread.join()

    def post(self, path, body, **headers):
        request = Request(self.base + path, data=json.dumps(body).encode(),
                          headers={"Content-Type": "application/json", **headers})
        try:
            return urlopen(request)
        except HTTPError as error:
            return error

    def test_only_explicit_guest_cart_actions_are_exposed(self):
        with patch("server.urlopen") as upstream:
            for path in ("/api/store/cart/checkout", "/api/store/orders", "/api/store/cart/add-item?x=1"):
                with self.post(path, {}, **{"Cart-Token": "a"}) as response:
                    self.assertEqual(response.code, 404)
            upstream.assert_not_called()

    def test_product_deep_links_serve_the_storefront_and_single_product_endpoint_is_bounded(self):
        with urlopen(self.base + "/product/temple-border-saree/") as response:
            self.assertIn(b'id="page-product"', response.read())
        with patch("server.urlopen", return_value=Upstream(b'{"id":42805,"name":"Indigo saree"}')) as upstream:
            with urlopen(self.base + "/api/catalog/products/42805") as response:
                self.assertEqual(json.load(response)["id"], 42805)
            self.assertTrue(upstream.call_args.args[0].full_url.endswith("/products/42805?"))
            with self.assertRaises(HTTPError) as refused:
                urlopen(self.base + "/api/catalog/products/42805/../../orders")
            self.assertEqual(refused.exception.code, 404)
            upstream.assert_called_once()

    def test_payment_submission_disabled_by_default(self):
        with patch("server.CHECKOUT_ENABLED", False), patch("server.urlopen") as upstream:
            with self.post('/api/store/checkout', {}, **{'Cart-Token':'test.session'}) as response:
                self.assertEqual(response.code, 503)
            upstream.assert_not_called()

    def test_token_and_same_origin_are_required_for_writes(self):
        with patch("server.urlopen") as upstream:
            with self.post("/api/store/cart/add-item", {"id": 1, "quantity": 1}) as response:
                self.assertEqual(response.code, 401)
            with self.post("/api/store/cart/add-item", {"id": 1, "quantity": 1},
                           **{"Cart-Token": "a", "Origin": "https://unrelated.example"}) as response:
                self.assertEqual(response.code, 403)
            upstream.assert_not_called()

    def test_each_request_forwards_only_its_token_and_responses_are_not_cached(self):
        with patch("server.urlopen", side_effect=lambda request, **kwargs: Upstream(b'{"items":[],"totals":{}}')) as upstream:
            for token in ("visitor.one", "visitor.two"):
                with self.post("/api/store/cart/add-item", {"id": 43214, "quantity": 1},
                               **{"Cart-Token": token, "Cookie": "wordpress_logged_in=never-forward"}) as response:
                    self.assertEqual(response.code, 200)
                    self.assertEqual(response.headers["Cache-Control"], "private, no-store")
                    self.assertEqual(response.headers["Cart-Token"], "isolated.response")
                request = upstream.call_args.args[0]
                self.assertEqual(request.get_header("Cart-token"), token)
                self.assertIsNone(request.get_header("Cookie"))
                self.assertEqual(json.loads(request.data), {"id": 43214, "quantity": 1})
            requests = [call.args[0] for call in upstream.call_args_list]
            self.assertNotEqual(requests[0].full_url, requests[1].full_url)
            self.assertIn("_aartyz_request=", requests[0].full_url)
            self.assertEqual(requests[0].get_header("Cache-control"), "no-cache, no-store")

    def test_upstream_stock_errors_are_preserved(self):
        error = HTTPError("https://aartyz.in", 400, "Bad Request", {}, io.BytesIO(b'{"message":"Not enough stock"}'))
        with patch("server.urlopen", side_effect=error):
            with self.post("/api/store/cart/add-item", {"id": 1, "quantity": 1}, **{"Cart-Token": "a"}) as response:
                self.assertEqual(response.code, 400)
                self.assertEqual(json.load(response)["message"], "Not enough stock")

    def test_rejects_price_injection_and_invalid_quantities(self):
        self.assertFalse(validate_cart_body("add-item", {"id": 1, "quantity": 1, "price": 1}))
        for value in (-1, 0, 1.5, True, "2", 10000):
            self.assertFalse(validate_cart_body("add-item", {"id": 1, "quantity": value}))
        self.assertTrue(validate_cart_body("add-item", {"id": 43214, "quantity": 1,
            "variation": [{"attribute": "pa_size", "value": "size-xl"}]}))

    def test_address_and_shipping_contracts_reject_price_or_payment_injection(self):
        address = {"first_name":"Checkout", "last_name":"Test", "address_1":"Test address", "city":"Nagpur",
                   "state":"MH", "postcode":"440025", "country":"IN", "email":"checkout-test@example.com", "phone":"0000000000"}
        body = {"billing_address":address, "shipping_address":address}
        self.assertTrue(validate_cart_body('update-customer', body))
        self.assertFalse(validate_cart_body('update-customer', {**body,"total":1}))
        self.assertFalse(validate_cart_body('update-customer', {**body,"shipping_address":{**address,"postcode":"invalid"}}))
        self.assertTrue(validate_cart_body('select-shipping-rate', {"package_id":0,"rate_id":"flat_rate:1"}))
        self.assertFalse(validate_cart_body('select-shipping-rate', {"package_id":0,"rate_id":"flat_rate:1","price":0}))
        checkout = {**body, "payment_method":"payubiz", "expected_total":"115000"}
        self.assertTrue(valid_checkout(checkout))
        self.assertFalse(valid_checkout({**checkout,"payment_method":"cod"}))
        self.assertFalse(valid_checkout({**checkout,"set_paid":True}))


if __name__ == "__main__":
    unittest.main()
