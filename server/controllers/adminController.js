const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const { httpError } = require("../middleware/errorHandler");

// GET /api/admin/stats
exports.getDashboardStats = async (req, res) => {
  const [
    totalCustomers,
    totalVendors,
    pendingVendors,
    totalProducts,
    totalOrders,
    revenue,
  ] = await Promise.all([
    User.countDocuments({ role: "customer" }),
    User.countDocuments({ role: "vendor" }),
    User.countDocuments({ role: "vendor", vendorStatus: "pending" }),
    Product.countDocuments(),
    Order.countDocuments(),
    Order.aggregate([
      { $match: { status: "delivered" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]),
  ]);

  res.json({
    totalCustomers,
    totalVendors,
    pendingVendors,
    totalProducts,
    totalOrders,
    totalRevenue: revenue[0]?.total || 0,
  });
};

// GET /api/admin/customers
exports.getAllCustomers = async (req, res) => {
  const customers = await User.find({ role: "customer" })
    .select("-password")
    .sort({ createdAt: -1 });
  res.json(customers);
};

const setBlocked = (isBlocked) => async (req, res) => {
  const customer = await User.findOneAndUpdate(
    { _id: req.params.id, role: "customer" },
    { isBlocked },
    { new: true }
  ).select("-password");
  if (!customer) throw httpError(404, "Customer not found");
  res.json({
    message: isBlocked ? "Customer blocked" : "Customer unblocked",
    customer,
  });
};

// PUT /api/admin/customers/:id/block and /unblock
exports.blockCustomer = setBlocked(true);
exports.unblockCustomer = setBlocked(false);

// GET /api/admin/vendors
exports.getAllVendors = async (req, res) => {
  const vendors = await User.find({ role: "vendor" })
    .select("-password")
    .sort({ createdAt: -1 })
    .lean();

  const counts = await Product.aggregate([
    { $group: { _id: "$vendor", count: { $sum: 1 } } },
  ]);
  const countMap = Object.fromEntries(
    counts.map((c) => [c._id.toString(), c.count])
  );

  res.json(
    vendors.map((v) => ({
      ...v,
      productCount: countMap[v._id.toString()] || 0,
    }))
  );
};

const setVendorStatus = (vendorStatus) => async (req, res) => {
  const vendor = await User.findOneAndUpdate(
    { _id: req.params.id, role: "vendor" },
    { vendorStatus },
    { new: true }
  ).select("-password");
  if (!vendor) throw httpError(404, "Vendor not found");
  res.json({ message: `Vendor ${vendorStatus}`, vendor });
};

// PUT /api/admin/vendors/:id/approve and /suspend
exports.approveVendor = setVendorStatus("approved");
exports.suspendVendor = setVendorStatus("suspended");

// GET /api/admin/orders
exports.getAllOrders = async (req, res) => {
  const orders = await Order.find()
    .sort({ createdAt: -1 })
    .populate("customer", "name email")
    .populate("vendor", "shopName");
  res.json(orders);
};
