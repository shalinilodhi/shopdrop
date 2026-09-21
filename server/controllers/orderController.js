const Cart = require("../models/Cart");
const Order = require("../models/Order");
const Product = require("../models/Product");
const { activeVendorIds } = require("./productController");
const { httpError } = require("../middleware/errorHandler");

// Put items back in stock (used for cancel / reject)
const restock = (items) =>
  Promise.all(
    items.map((item) =>
      Product.updateOne(
        { _id: item.product },
        { $inc: { stock: item.quantity } }
      )
    )
  );

// POST /api/orders/checkout  { shippingAddress, phone }
exports.checkout = async (req, res) => {
  const { shippingAddress, phone } = req.body;
  if (!shippingAddress || !phone) {
    throw httpError(400, "Delivery address and phone are required");
  }

  const cart = await Cart.findOne({ user: req.user._id }).populate(
    "items.product"
  );
  const items = (cart?.items || []).filter((item) => item.product);
  if (items.length === 0) throw httpError(400, "Your cart is empty");

  const activeIds = (await activeVendorIds()).map(String);
  for (const { product, quantity } of items) {
    if (!activeIds.includes(product.vendor.toString())) {
      throw httpError(400, `"${product.name}" is no longer available`);
    }
    if (quantity > product.stock) {
      throw httpError(
        400,
        `Only ${product.stock} "${product.name}" left in stock`
      );
    }
  }

  // Reserve stock; the stock condition stops two buyers taking the last one
  const reserved = [];
  for (const { product, quantity } of items) {
    const result = await Product.updateOne(
      { _id: product._id, stock: { $gte: quantity } },
      { $inc: { stock: -quantity } }
    );
    if (result.modifiedCount === 0) {
      await restock(reserved);
      throw httpError(409, `"${product.name}" just went out of stock`);
    }
    reserved.push({ product: product._id, quantity });
  }

  // Split the cart into one order per vendor
  const byVendor = {};
  for (const { product, quantity } of items) {
    const vendorId = product.vendor.toString();
    byVendor[vendorId] = byVendor[vendorId] || [];
    byVendor[vendorId].push({
      product: product._id,
      name: product.name,
      price: product.price,
      quantity,
    });
  }

  const orders = await Order.insertMany(
    Object.entries(byVendor).map(([vendor, vendorItems]) => ({
      customer: req.user._id,
      vendor,
      items: vendorItems,
      totalAmount: vendorItems.reduce((s, i) => s + i.price * i.quantity, 0),
      shippingAddress,
      phone,
    }))
  );

  await Cart.deleteOne({ user: req.user._id });
  res.status(201).json({ message: "Order placed successfully", orders });
};

// GET /api/orders/my
exports.getMyOrders = async (req, res) => {
  const orders = await Order.find({ customer: req.user._id })
    .sort({ createdAt: -1 })
    .populate("vendor", "shopName phone");
  res.json(orders);
};

// PUT /api/orders/:id/cancel
exports.cancelOrder = async (req, res) => {
  const order = await Order.findOne({
    _id: req.params.id,
    customer: req.user._id,
  });
  if (!order) throw httpError(404, "Order not found");
  if (order.status !== "pending") {
    throw httpError(400, "Only pending orders can be cancelled");
  }

  order.status = "cancelled";
  await order.save();
  await restock(order.items);
  res.json({ message: "Order cancelled", order });
};

exports.restock = restock;
