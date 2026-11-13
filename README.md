# Aartyz custom storefront preview

The custom cards read the **public WooCommerce Store API** on `aartyz.in`. Products,
photos, prices, price ranges, categories and stock status come from WooCommerce;
there are no admin API keys or embedded demo products.

## Run locally

```sh
python3 server.py --port 8765
```

Open <http://localhost:8765>. Use this server instead of `python -m http.server`
or opening `index.html` directly. It serves the UI and proxies public catalogue
reads and an explicit allowlist of guest cart operations. No WordPress login
cookies or admin credentials are sent to WooCommerce.

## Current behaviour

- Reads every product/category page, in batches of up to three requests.
- Loads category taxonomy and ancestry from WooCommerce. Menus, counts, collection imagery, attributes and price bounds use that data. New categories open at `#collection-ID` without adding a custom page; legacy layout routes remain supported.
- Filters use published product attributes and categories. Values within a group match any selected value; different groups are combined. Variable prices match when their range intersects the selected range.
- Sample product cards, testimonials/Instagram posts, an artificial countdown, fixed gift values and unsupported bestselling labels have been removed.
- New Arrivals uses the full catalogue in WooCommerce publication order, with the newest products first.
- Lists show 24 cards at a time, with Show more. The homepage shows three studio edits before the original-store campaign banners.
- Missing prices display “Price unavailable”; unknown quantities are never invented.
- Product cards use the existing WordPress `/product/<slug>/` paths where possible
  (fallback `/products/<id>/`). Legacy `#product-ID` links still work. A direct product
  link requests the single public product by ID or slug without waiting for all
  catalogue pages. Descriptions, galleries, stock, prices and options come from WooCommerce.
- Simple and variable products support quantity selection and Add to cart.
  Variable products load their current variation records on opening. Every required
  attribute must be selected; unavailable/unpriced choices are disabled. Selecting
  a variation updates its actual price and quantity limits. Special product types,
  such as plugin-based gift cards, require their own integration and cannot be added yet.
- Cart navigation stays in the custom UI. Add, update, remove, apply-coupon and
  remove-coupon requests go to WooCommerce, which returns all displayed totals.
  The preview never invents shipping rates, discounts or available stock quantities.
- The guest cart token is stored in this browser's localStorage (when available)
  so reloading restores the same WooCommerce guest cart. It is separate from the
  existing WordPress browser cart and logged-in account. Treat cart tokens as private.
- Cart responses are never cached. Upstream requests include a unique cache-busting
  parameter and no-cache headers: the hosting cache was observed returning the same
  initial guest token for identical anonymous requests without this protection.
- Cart mutations are serialized and never automatically replayed after a network
  error; a read reconciles state before the user retries. Expired sessions can be
  replaced on cart reload. Cross-origin browser requests and injected price fields
  are rejected by the local proxy.
- Checkout at `#page-checkout` collects an Indian delivery/billing address, sends it
  to WooCommerce, displays actual shipping packages/rates, and recalculates totals.
  Address/cart/rate changes invalidate the previously reviewed quote. No contact
  details are stored separately in browser storage.
- The configured gateway ID is `payubiz`. Payment submission code passes the guest
  cart, addresses and expected total to WooCommerce and accepts only HTTPS store
  or PayU payment redirects. It never marks an order paid or clears the cart based
  on the browser callback; WooCommerce/PayU own payment confirmation.
- PayU sandbox order #12 completed for ₹10 on the temporary Hostinger store and
  WooCommerce recorded it as Processing. Local payment submission remains disabled
  by default. For another sandbox run, set `AARTYZ_STORE_URL` to the test store and
  enable `AARTYZ_CHECKOUT_ENABLED=1` only while PayU uses sandbox credentials.
- Before production, verify the PayU plugin's Store API compatibility, total
  mismatch handling on the installed WooCommerce version, duplicate/reloaded
  submissions and interrupted payment recovery, callbacks/webhooks, stock release,
  success/failure/cancellation and refunds. A submission failure is not automatically
  retried: it may have created an order, so the UI asks to check with the store.
- Inventory quantity tracking must still be enabled in WooCommerce for products
  that need automatic stock deduction. Special product types and account integration
  remain separate from this guest checkout flow.
- Reload the preview to retrieve catalogue changes. No persistent snapshot is used.
  Loading/error/empty states are explicit, with a retry button on errors.

## Deployment

The Hostinger Web App entry point is `npm start` on Node.js 22 or newer.
`storefront-server.mjs` serves the storefront and proxies the public catalogue
and guest cart. Set `AARTYZ_PUBLIC_ORIGIN` to the assigned HTTPS frontend origin
so browser cart writes pass the origin check. Set `AARTYZ_STORE_URL` to the
approved WooCommerce HTTPS origin. The server defaults to `https://aartyz.in`
and binds to Hostinger’s `PORT`.

The deployment sends `X-Robots-Tag: noindex` during review. Checkout is off by
default. To enable PayU, explicitly set both HTTPS origins to different hosts
and set `AARTYZ_CHECKOUT_ENABLED=1`. WooCommerce still serves the payment handoff
and receives PayU callbacks. Exclude cart and checkout routes from hosting and
CDN caches. Keep PayU credentials in the WooCommerce plugin settings.

For cutover, back up the existing store and move WooCommerce to a separate
origin (for example, `https://store.aartyz.in`). Verify inventory, order history,
shipping and the new callback URLs before assigning `https://aartyz.in` to the
custom frontend. Verify any PayU merchant or callback domain settings with PayU.
The checkout proxy rechecks the reviewed cart total before submitting, but
WooCommerce still determines the final order total at order creation.

The live site's unrelated casino content still needs investigation before launch;
this catalogue connection does not repair the WordPress installation. Keep this
preview off the public domain until the production WooCommerce origin is confirmed
clean and payment tests pass. Move the full approved policies and tracking to a
verified destination before switching DNS; the preview’s help page summarises
the existing policy and links to the current complete documents. Editorial
workshop photos are local; WooCommerce still controls product media.

For production routing, preserve the existing product slugs and serve the
storefront for the supported product and editorial paths (see `STOREFRONT_PAGES`
and `PRODUCT_PATH` in `server.py`). Preserve or redirect any remaining legacy
collections and content after reviewing the current sitemap; do not redirect
unrelated or spam URLs to the store. Verify the canonical host, page metadata
and Search Console indexing after cutover. The preview server is not a production
hosting configuration.

## Checks

```sh
node --check script.js
node --check woo-catalog.js
node --check woo-cart.js
node --test tests/*.test.js
python3 -m unittest discover -s tests -p 'test_*.py'
python3 -m py_compile server.py
```

The Python proxy tests mock the upstream and require permission to bind a local
loopback port. Live guest-cart verification covered exact variation IDs, quantity
updates, reload persistence, separate guest sessions, invalid coupons, sold-out
rejection and cleanup. No order was placed and payment settings were not changed. Checkout address/rate calculation was also verified with a disposable guest cart and synthetic example.com contact details; the test cart was emptied.

## Editorial content and integration settings

Visual design, brand copy, contact details, imported banner artwork and the
user-selected Diwali ’26 campaign are editorial content. WooCommerce’s public
product API does not manage these; they are separate from live commerce facts.
The store URL and payment submission gate remain server environment settings.
Checkout currently supports Indian delivery addresses and the configured PayU
integration; removing demo data does not enable payments or broaden that scope.
Catalogue changes are fetched on storefront reload, with no demo fallback.

## Brand and customer paths

- The Block Print, Hand-painted and Diwali edits use editorial WooCommerce IDs
  listed in `EDITS` in `script.js`. Cards appear only for live, priced, purchasable
  and in-stock pieces. Update the curated selections before changing a campaign.
- `/from-instagram/` links to the original Reels and prepares a WhatsApp enquiry
  including the exact Reel. Shareable entry anchors are `#reel-city-saree`,
  `#reel-blue-set` and `#reel-table-linen`. Replace each enquiry CTA with its exact
  product path once the team confirms the SKU, fabric and stock; don't match by
  similar names alone.
- `/visit/` contains both public locations. Confirm current opening hours before
  publishing hours or running a local promotion. The corporate gifting and
  made-to-order pages prepare separate WhatsApp briefs; shoppers send them themselves.
- Before promoting a product, reconcile the WooCommerce title and fabric/technique
  fields, then verify price, stock, care, dispatch and category-specific returns.
  Existing discrepancies (such as the yellow daisy and purple abstract sarees)
  must be corrected in WooCommerce.

## Navigation and wiring checks

Collection cards, desktop/mobile menus and product breadcrumbs bind to actual
WooCommerce category IDs. Category images and counts use that same scope.
Page, collection and product URLs support refresh and browser Back/Forward;
collection filters are preserved when returning from a product or refreshing data.
Wishlist controls save product IDs in local browser storage and re-read product
details from the catalogue. Search supports typing, its button and Enter.
Variable products offer Clear choices, and old option requests cannot overwrite a
newer response for the same product.

Contact enquiries prepare an email draft addressed to the email published on the
original contact page. Users review and send that draft in their email app; the
storefront does not claim a message was delivered. Social/policy links point to
verified original-store destinations, and order tracking opens the existing store's
tracking page. No messages were sent during verification.

`tests/browser-wiring-audit.js` is a browser integration function exercised against
the loaded catalogue. It passed 212 assertions, including 149 category links,
29 collection tiles, banners, search, wishlist, history and filter restoration.
`tests/browser-cart-mock.js` installs a fetch mock before page scripts in an isolated
browser context. `tests/browser-shopping-audit.js` then exercised 15 cart/delivery
checks and eight locally mocked mutations. It blocks other writes and keeps payment
submission disabled. No real orders or payments were created; this does not replace
PayU staging verification.
