import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

/* ================= TOKEN INTERCEPTOR ================= */
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

// Expired token or blocked account: log out and go to login
API.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const isAuthCall = err.config?.url?.startsWith("/auth/login");
    const blocked = status === 403 && /blocked/i.test(err.response?.data?.message);
    if ((status === 401 || blocked) && !isAuthCall && localStorage.getItem("token")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

const data = (promise) => promise.then((res) => res.data);

/* ================= AUTH ================= */
export const loginUser = (body) => data(API.post("/auth/login", body));
export const registerUser = (body) => data(API.post("/auth/register", body));
export const getMe = () => data(API.get("/auth/me"));
export const updateMe = (body) => data(API.put("/auth/me", body));

/* ================= PRODUCTS (PUBLIC) ================= */
export const fetchProducts = (params) => data(API.get("/products", { params }));
export const fetchCategories = () => data(API.get("/products/categories"));

/* ================= CART (CUSTOMER) ================= */
export const getCart = () => data(API.get("/cart"));
export const addCartItem = (productId, quantity = 1) =>
  data(API.post("/cart", { productId, quantity }));
export const updateCartItem = (productId, quantity) =>
  data(API.put(`/cart/${productId}`, { quantity }));
export const removeCartItem = (productId) =>
  data(API.delete(`/cart/${productId}`));
export const clearCartItems = () => data(API.delete("/cart"));

/* ================= ORDERS (CUSTOMER) ================= */
export const checkout = (body) => data(API.post("/orders/checkout", body));
export const fetchMyOrders = () => data(API.get("/orders/my"));
export const cancelOrder = (id) => data(API.put(`/orders/${id}/cancel`));

/* ================= VENDOR ================= */
export const fetchVendorStats = () => data(API.get("/vendor/stats"));
export const fetchVendorProducts = () => data(API.get("/vendor/products"));
export const addVendorProduct = (body) =>
  data(API.post("/vendor/products", body));
export const updateVendorProduct = (id, body) =>
  data(API.put(`/vendor/products/${id}`, body));
export const deleteVendorProduct = (id) =>
  data(API.delete(`/vendor/products/${id}`));
export const fetchVendorOrders = () => data(API.get("/vendor/orders"));
export const updateOrderStatus = (id, status) =>
  data(API.put(`/vendor/orders/${id}/status`, { status }));

/* ================= ADMIN ================= */
export const fetchAdminStats = () => data(API.get("/admin/stats"));
export const fetchCustomers = () => data(API.get("/admin/customers"));
export const setCustomerBlocked = (id, block) =>
  data(API.put(`/admin/customers/${id}/${block ? "block" : "unblock"}`));
export const fetchVendors = () => data(API.get("/admin/vendors"));
export const approveVendor = (id) =>
  data(API.put(`/admin/vendors/${id}/approve`));
export const suspendVendor = (id) =>
  data(API.put(`/admin/vendors/${id}/suspend`));
export const fetchAllOrders = () => data(API.get("/admin/orders"));

export default API;
