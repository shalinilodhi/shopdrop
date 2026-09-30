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

## Project structure

```
server/
  models/        User, Product, Cart, Order schemas
  controllers/   auth, product, cart, order, vendor, admin logic
  routes/        URL to controller mapping
  middleware/    protect (JWT), allowRoles, error handler
  config/db.js   MongoDB connection
  seed.js        creates the admin + demo data

client/src/
  pages/         Home, Products, Cart, Checkout, Orders, Profile,
                 vendor/ and admin/ dashboards
  components/    Navbar, Footer, Logo, StatusBadge
  context/       AuthContext (login state), CartContext (cart state)
  api/api.js     one axios client for every endpoint
  routes/        ProtectedRoute (role based)
  styles/        plain CSS, brand tokens in global.css
```

## Tests

```bash
npm start                # terminal 1: API must be running
npm run test:api         # 47 checks: auth, roles, products, cart, checkout, stock, admin
npm run test:live        # smoke test against the deployed site
```

`test:api` covers the paths that matter: a customer cannot reach admin routes,
a pending vendor cannot add products, the cart refuses more than the stock,
checkout splits an order per shop and decreases stock, cancelling puts it back,
and a blocked user cannot log in. Point it at any server with
`API_URL=https://.../api npm run test:api`.

## Live site

https://shopndrop-shalini-lodhi-s-projects.vercel.app
