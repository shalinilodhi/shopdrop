const Product = require("../models/Product");
const Order = require("../models/Order");
const { restock } = require("./orderController");
const { httpError } = require("../middleware/errorHandler");

const PRODUCT_FIELDS = [
  "name",
  "price",
  "category",
  "description",
  "image",
  "stock",
];

const pickProductFields = (body) =>
  Object.fromEntries(
    PRODUCT_FIELDS.filter((f) => body[f] !== undefined).map((f) => [
      f,
      body[f],
    ])
  );

const requireApproved = (user) => {
  if (user.vendorStatus !== "approved") {
    throw httpError(
      403,
      user.vendorStatus === "suspended"
        ? "Your shop is suspended by the admin"
        : "Your shop is waiting for admin approval"
    );
  }
};

// GET /api/vendor/stats
exports.getStats = async (req, res) => {
  const vendor = req.user._id;
  const [totalProducts, totalOrders, pendingOrders, revenue] =
    await Promise.all([
      Product.countDocuments({ vendor }),
      Order.countDocuments({ vendor }),
      Order.countDocuments({ vendor, status: "pending" }),
      Order.aggregate([
        { $match: { vendor, status: "delivered" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
    ]);

  res.json({
    totalProducts,
    totalOrders,
    pendingOrders,
    revenue: revenue[0]?.total || 0,
    vendorStatus: req.user.vendorStatus,
  });
};

// GET /api/vendor/products
exports.getMyProducts = async (req, res) => {
  const products = await Product.find({ vendor: req.user._id }).sort({
    createdAt: -1,
  });
  res.json(products);
};

// POST /api/vendor/products
exports.addProduct = async (req, res) => {
  requireApproved(req.user);
  const product = await Product.create({
    ...pickProductFields(req.body),
    vendor: req.user._id,
  });
  res.status(201).json(product);
};

// PUT /api/vendor/products/:id
exports.updateProduct = async (req, res) => {
  requireApproved(req.user);
  const product = await Product.findOneAndUpdate(
    { _id: req.params.id, vendor: req.user._id },
    pickProductFields(req.body),
    { new: true, runValidators: true }
  );
  if (!product) throw httpError(404, "Product not found");
  res.json(product);
};

// DELETE /api/vendor/products/:id
exports.deleteProduct = async (req, res) => {
  const product = await Product.findOneAndDelete({
    _id: req.params.id,
    vendor: req.user._id,
  });
  if (!product) throw httpError(404, "Product not found");
  res.json({ message: "Product deleted" });
};

// GET /api/vendor/orders
exports.getMyOrders = async (req, res) => {
  const orders = await Order.find({ vendor: req.user._id })
    .sort({ createdAt: -1 })
    .populate("customer", "name email phone");
  res.json(orders);
};

// Which status a vendor may move an order to, from each status
const NEXT_STATUS = {
  pending: ["accepted", "rejected"],
  accepted: ["delivered"],
};

// PUT /api/vendor/orders/:id/status  { status }
exports.updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const order = await Order.findOne({
    _id: req.params.id,
    vendor: req.user._id,
  });
  if (!order) throw httpError(404, "Order not found");

  if (!(NEXT_STATUS[order.status] || []).includes(status)) {
    throw httpError(
      400,
      `Cannot change a ${order.status} order to ${status}`
    );
  }

  order.status = status;
  await order.save();
  if (status === "rejected") await restock(order.items);

  await order.populate("customer", "name email phone");
  res.json({ message: `Order ${status}`, order });
};
