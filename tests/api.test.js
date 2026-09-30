// API tests: register, login, roles, products, cart, checkout, stock, admin.
// Start the server first, then: npm run test:api
// Point it elsewhere with:  API_URL=https://your-site/api npm run test:api
const BASE = process.env.API_URL || "http://localhost:5000/api";
let failures = 0;
const check = (cond, label) => {
  console.log((cond ? "PASS " : "FAIL ") + label);
  if (!cond) failures++;
};
const call = async (method, path, body, token) => {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: "Bearer " + token } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try { data = await res.json(); } catch {}
  return { status: res.status, data };
};

(async () => {
  const t = Date.now();
  // Register
  let r = await call("POST", "/auth/register", { name: "Hacker", email: `a${t}@x.com`, password: "secret1", role: "admin" });
  check(r.status === 201 && r.data.user.role === "customer", "admin self-register downgraded to customer");
  r = await call("POST", "/auth/register", { name: "V", email: `v${t}@x.com`, password: "secret1", role: "vendor" });
  check(r.status === 400, "vendor without shopName rejected");
  r = await call("POST", "/auth/register", { name: "V", email: `v${t}@x.com`, password: "secret1", role: "vendor", shopName: "Test Shop" });
  check(r.status === 201 && r.data.user.vendorStatus === "pending", "vendor registers as pending");
  r = await call("POST", "/auth/register", { name: "C", email: `c${t}@x.com`, password: "secret1", role: "customer" });
  check(r.status === 201, "customer registers");
  r = await call("POST", "/auth/register", { name: "C", email: `c${t}@x.com`, password: "secret1" });
  check(r.status === 400, "duplicate email rejected");

  // Login
  const admin = (await call("POST", "/auth/login", { email: "admin@shopndrop.com", password: "admin123" })).data;
  check(admin.token && admin.user.role === "admin", "admin logs in");
  const vendor = (await call("POST", "/auth/login", { email: `v${t}@x.com`, password: "secret1" })).data;
  const cust = (await call("POST", "/auth/login", { email: `c${t}@x.com`, password: "secret1" })).data;
  check(vendor.token && cust.token, "vendor and customer log in");
  r = await call("POST", "/auth/login", { email: `c${t}@x.com`, password: "wrong" });
  check(r.status === 400, "wrong password rejected");

  // Role guards
  r = await call("GET", "/admin/stats", null, cust.token);
  check(r.status === 403, "customer cannot access admin");
  r = await call("GET", "/admin/stats");
  check(r.status === 401, "no token -> 401");

  // Pending vendor cannot add products
  const productBody = { name: "Mango", price: 100, category: "Fruits", stock: 3, image: "" };
  r = await call("POST", "/vendor/products", productBody, vendor.token);
  check(r.status === 403, "pending vendor cannot add product");

  // Admin approves
  const vendors = (await call("GET", "/admin/vendors", null, admin.token)).data;
  const v = vendors.find((x) => x.email === `v${t}@x.com`);
  r = await call("PUT", `/admin/vendors/${v._id}/approve`, null, admin.token);
  check(r.status === 200 && r.data.vendor.vendorStatus === "approved", "admin approves vendor");

  r = await call("POST", "/vendor/products", productBody, vendor.token);
  check(r.status === 201, "approved vendor adds product");
  const pid = r.data._id;
  r = await call("POST", "/vendor/products", { name: "Bad" }, vendor.token);
  check(r.status === 400, "invalid product rejected: " + r.data?.message);
  r = await call("PUT", `/vendor/products/${pid}`, { price: 120 }, vendor.token);
  check(r.status === 200 && r.data.price === 120, "vendor edits product");

  // Browse / filter
  r = await call("GET", "/products?search=mang&category=Fruits&minPrice=100&maxPrice=150");
  check(r.data.some((p) => p._id === pid && p.vendor.shopName === "Test Shop"), "search + filter finds product");
  r = await call("GET", "/products?maxPrice=50&search=mango");
  check(!r.data.some((p) => p._id === pid), "price filter excludes product");
  r = await call("GET", "/products?search=(((");
  check(r.status === 200, "regex special chars in search are safe");
  r = await call("GET", "/products/categories");
  check(r.data.includes("Fruits"), "categories list");

  // Cart
  r = await call("POST", "/cart", { productId: pid, quantity: 2 }, cust.token);
  check(r.status === 200 && r.data.items[0].quantity === 2, "add to cart");
  r = await call("POST", "/cart", { productId: pid, quantity: 5 }, cust.token);
  check(r.status === 400, "cannot exceed stock");
  r = await call("PUT", `/cart/${pid}`, { quantity: 3 }, cust.token);
  check(r.data.items[0].quantity === 3, "update cart quantity");
  r = await call("POST", "/cart", { productId: pid }, vendor.token);
  check(r.status === 403, "vendor cannot use cart");

  // Checkout
  r = await call("POST", "/orders/checkout", {}, cust.token);
  check(r.status === 400, "checkout needs address");
  r = await call("POST", "/orders/checkout", { shippingAddress: "1 Road", phone: "999" }, cust.token);
  check(r.status === 201 && r.data.orders.length === 1 && r.data.orders[0].totalAmount === 360, "checkout creates order (3 x 120)");
  const oid = r.data.orders[0]._id;
  r = await call("GET", "/cart", null, cust.token);
  check(r.data.items.length === 0, "cart cleared after checkout");
  r = await call("GET", `/products/${pid}`);
  check(r.data.stock === 0, "stock decremented");

  // Vendor handles order
  r = await call("GET", "/vendor/orders", null, vendor.token);
  check(r.data.length === 1 && r.data[0].customer.name === "C", "vendor sees order");
  r = await call("PUT", `/vendor/orders/${oid}/status`, { status: "delivered" }, vendor.token);
  check(r.status === 400, "cannot skip pending -> delivered");
  r = await call("PUT", `/vendor/orders/${oid}/status`, { status: "accepted" }, vendor.token);
  check(r.status === 200 && r.data.order.status === "accepted", "vendor accepts order");
  r = await call("PUT", `/orders/${oid}/cancel`, null, cust.token);
  check(r.status === 400, "customer cannot cancel accepted order");
  r = await call("PUT", `/vendor/orders/${oid}/status`, { status: "delivered" }, vendor.token);
  check(r.data.order?.status === "delivered", "vendor marks delivered");
  r = await call("GET", "/vendor/stats", null, vendor.token);
  check(r.data.revenue === 360 && r.data.totalOrders === 1, "vendor stats");

  // Cancel flow restocks
  await call("PUT", `/vendor/products/${pid}`, { stock: 5 }, vendor.token);
  await call("POST", "/cart", { productId: pid, quantity: 2 }, cust.token);
  r = await call("POST", "/orders/checkout", { shippingAddress: "1 Road", phone: "999" }, cust.token);
  r = await call("PUT", `/orders/${r.data.orders[0]._id}/cancel`, null, cust.token);
  check(r.status === 200, "customer cancels pending order");
  r = await call("GET", `/products/${pid}`);
  check(r.data.stock === 5, "cancel restores stock");
  r = await call("GET", "/orders/my", null, cust.token);
  check(r.data.length === 2, "customer order history");

  // Admin
  r = await call("GET", "/admin/stats", null, admin.token);
  check(r.data.totalOrders >= 2 && r.data.totalRevenue >= 360, "admin stats");
  r = await call("GET", "/admin/orders", null, admin.token);
  check(r.data.length >= 2 && r.data[0].vendor.shopName, "admin sees orders");
  const customers = (await call("GET", "/admin/customers", null, admin.token)).data;
  const c = customers.find((x) => x.email === `c${t}@x.com`);
  check(c && !c.password, "admin lists customers without passwords");
  r = await call("PUT", `/admin/customers/${c._id}/block`, null, admin.token);
  check(r.data.customer.isBlocked === true, "admin blocks customer");
  r = await call("GET", "/cart", null, cust.token);
  check(r.status === 403, "blocked customer's token rejected");
  r = await call("POST", "/auth/login", { email: `c${t}@x.com`, password: "secret1" });
  check(r.status === 403, "blocked customer cannot login");
  await call("PUT", `/admin/customers/${c._id}/unblock`, null, admin.token);
  r = await call("POST", "/auth/login", { email: `c${t}@x.com`, password: "secret1" });
  check(r.status === 200, "unblocked customer can login");

  // Suspend hides products
  await call("PUT", `/admin/vendors/${v._id}/suspend`, null, admin.token);
  r = await call("GET", "/products?search=mango");
  check(!r.data.some((p) => p._id === pid), "suspended vendor's products hidden");
  r = await call("GET", "/products/not-an-id");
  check(r.status === 400, "bad id -> 400");

  // Profile
  r = await call("PUT", "/auth/me", { phone: "111", newPassword: "newpass1", currentPassword: "nope" }, cust.token);
  check(r.status === 400, "password change needs current password");
  r = await call("PUT", "/auth/me", { phone: "111", address: "Home" }, cust.token);
  check(r.data.user?.phone === "111", "profile update");

  console.log(failures ? `\n${failures} FAILED` : "\nALL PASSED");
  process.exit(failures ? 1 : 0);
})();
