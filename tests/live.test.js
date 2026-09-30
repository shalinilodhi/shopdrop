// Smoke test for the deployed site: one full order from browsing to delivery.
//   npm run test:live
// Override the target with:  LIVE_URL=https://your-site npm run test:live
const B = (process.env.LIVE_URL || "https://shopndrop-shalini-lodhi-s-projects.vercel.app") + "/api";
let fail = 0;
const check = (c, l) => { console.log((c ? "PASS " : "FAIL ") + l); if (!c) fail++; };
const call = async (m, p, body, token) => {
  const r = await fetch(B + p, {
    method: m,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: "Bearer " + token } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  let d = null;
  try { d = await r.json(); } catch {}
  return { s: r.status, d };
};

(async () => {
  const t = Date.now();

  // Public browsing
  let r = await call("GET", "/products");
  check(r.s === 200 && r.d.length >= 7, `products list (${r.d?.length} items)`);
  check(r.d.every((p) => p.vendor?.shopName), "each product shows its shop");
  r = await call("GET", "/products?search=milk");
  check(r.d.length >= 1 && r.d[0].name.toLowerCase().includes("milk"), "search works");
  r = await call("GET", "/products?category=Bakery&maxPrice=50");
  check(r.d.every((p) => p.category === "Bakery" && p.price <= 50), "category + price filter");

  // Auth
  r = await call("POST", "/auth/login", { email: "admin@shopndrop.com", password: "admin123" });
  const admin = r.d;
  check(r.s === 200 && admin.user.role === "admin", "admin login");
  r = await call("POST", "/auth/login", { email: "admin@shopndrop.com", password: "wrong" });
  check(r.s === 400, "wrong password rejected");
  r = await call("GET", "/admin/stats");
  check(r.s === 401, "admin stats need a token");

  const cust = (await call("POST", "/auth/login", { email: "customer@shopndrop.com", password: "customer123" })).d;
  const vendor = (await call("POST", "/auth/login", { email: "vendor1@shopndrop.com", password: "vendor123" })).d;
  check(cust.token && vendor.token, "customer and vendor login");
  r = await call("GET", "/admin/stats", null, cust.token);
  check(r.s === 403, "customer blocked from admin API");

  // Register a throwaway vendor, admin approves
  const email = `live${t}@test.com`;
  r = await call("POST", "/auth/register", { name: "Live Test", email, password: "test123", role: "vendor", shopName: `Live Test Shop ${t}` });
  check(r.s === 201 && r.d.user.vendorStatus === "pending", "vendor registers as pending");
  const newVendor = (await call("POST", "/auth/login", { email, password: "test123" })).d;
  r = await call("POST", "/vendor/products", { name: "Test Item", price: 10, category: "Fruits", stock: 5 }, newVendor.token);
  check(r.s === 403, "pending vendor cannot add products");

  const vendors = (await call("GET", "/admin/vendors", null, admin.token)).d;
  const v = vendors.find((x) => x.email === email);
  r = await call("PUT", `/admin/vendors/${v._id}/approve`, null, admin.token);
  check(r.s === 200, "admin approves vendor");

  r = await call("POST", "/vendor/products", { name: `Live Mango ${t}`, price: 199, category: "Fruits", stock: 3 }, newVendor.token);
  check(r.s === 201, "approved vendor adds product");
  const pid = r.d._id;

  // Customer order
  r = await call("POST", "/cart", { productId: pid, quantity: 5 }, cust.token);
  check(r.s === 400, "cannot add more than stock");
  r = await call("POST", "/cart", { productId: pid, quantity: 2 }, cust.token);
  check(r.s === 200 && r.d.items.length >= 1, "add to cart");
  r = await call("POST", "/orders/checkout", { shippingAddress: "Live test address", phone: "9999999999" }, cust.token);
  check(r.s === 201, "checkout creates order(s)");
  const order = r.d.orders.find((o) => o.items.some((i) => i.product === pid)) || r.d.orders[0];
  check(order.totalAmount === 398, `order total correct (${order.totalAmount})`);

  r = await call("GET", `/products/${pid}`);
  check(r.d.stock === 1, `stock reduced to ${r.d.stock}`);

  // Vendor handles it
  r = await call("GET", "/vendor/orders", null, newVendor.token);
  check(r.d.length === 1, "vendor sees the order");
  r = await call("PUT", `/vendor/orders/${order._id}/status`, { status: "delivered" }, newVendor.token);
  check(r.s === 400, "cannot jump pending -> delivered");
  r = await call("PUT", `/vendor/orders/${order._id}/status`, { status: "accepted" }, newVendor.token);
  check(r.s === 200, "vendor accepts");
  r = await call("PUT", `/vendor/orders/${order._id}/status`, { status: "delivered" }, newVendor.token);
  check(r.s === 200, "vendor delivers");
  r = await call("GET", "/orders/my", null, cust.token);
  check(r.d.some((o) => o._id === order._id && o.status === "delivered"), "customer sees delivered order");

  // Clean up the test data so the demo site stays tidy
  await call("DELETE", `/vendor/products/${pid}`, null, newVendor.token);
  await call("PUT", `/admin/vendors/${v._id}/suspend`, null, admin.token);
  console.log("\ncleanup: test product deleted, test vendor suspended");

  console.log(fail ? `\n${fail} FAILED` : "\nALL LIVE CHECKS PASSED");
})();
