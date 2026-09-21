# ShopNDrop

A local e-commerce platform that connects customers with nearby vendors.
React + Node.js/Express + MongoDB, with JWT auth and bcrypt password hashing.

## Run it

Needs Node.js and MongoDB (local, or set `MONGO_URI` in `server/.env`).

```bash
npm install                 # backend deps
npm install --prefix client # frontend deps
npm run seed:demo           # admin + demo vendors/products/customer
npm start                   # API on http://localhost:5000
npm run client              # (new terminal) app on http://localhost:3000
```

`server/.env`:

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/shopndrop
JWT_SECRET=change-me
```

## Demo accounts

| Role     | Email                  | Password    |
|----------|------------------------|-------------|
| Admin    | admin@shopndrop.com    | admin123    |
| Vendor   | vendor1@shopndrop.com  | vendor123   |
| Vendor   | vendor2@shopndrop.com  | vendor123   |
| Customer | customer@shopndrop.com | customer123 |

Admin accounts are only created by `npm run seed` (never from the sign-up form).

## How it works

- **Customer**: browse, search, filter by category and price, cart, checkout
  (cash on delivery), track orders, cancel a pending order.
- **Vendor**: signs up as *pending*. After admin approval, can add, edit and
  delete products and accept, reject or deliver orders.
- **Admin**: dashboard stats, approve or suspend vendors, block customers,
  view all orders.
- A checkout with items from several shops creates one order per shop.
  Stock goes down when an order is placed and back up when it is cancelled
  or rejected.
- Suspended vendors' products are hidden. Blocked users cannot log in.

## API

| Method | Path | Who |
|---|---|---|
| POST | /api/auth/register, /api/auth/login | public |
| GET/PUT | /api/auth/me | logged in |
| GET | /api/products, /api/products/categories, /api/products/:id | public |
| GET/POST/DELETE | /api/cart, PUT/DELETE /api/cart/:productId | customer |
| POST | /api/orders/checkout, GET /api/orders/my, PUT /api/orders/:id/cancel | customer |
| GET | /api/vendor/stats, /api/vendor/orders | vendor |
| GET/POST/PUT/DELETE | /api/vendor/products[/:id] | vendor |
| PUT | /api/vendor/orders/:id/status | vendor |
| GET | /api/admin/stats, /customers, /vendors, /orders | admin |
| PUT | /api/admin/customers/:id/block, /unblock | admin |
| PUT | /api/admin/vendors/:id/approve, /suspend | admin |
