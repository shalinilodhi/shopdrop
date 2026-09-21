const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { httpError } = require("../middleware/errorHandler");

// Load the user's cart with product details, dropping deleted products
const loadCart = async (userId) => {
  const cart = await Cart.findOne({ user: userId }).populate({
    path: "items.product",
    populate: { path: "vendor", select: "shopName" },
  });
  if (!cart) return { items: [] };

  const liveItems = cart.items.filter((item) => item.product);
  if (liveItems.length !== cart.items.length) {
    cart.items = liveItems;
    await cart.save();
  }
  return cart;
};

// GET /api/cart
exports.getCart = async (req, res) => {
  res.json(await loadCart(req.user._id));
};

// POST /api/cart  { productId, quantity }
exports.addToCart = async (req, res) => {
  const { productId } = req.body;
  const quantity = Math.max(1, parseInt(req.body.quantity, 10) || 1);

  const product = await Product.findById(productId);
  if (!product) throw httpError(404, "Product not found");

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = new Cart({ user: req.user._id, items: [] });

  const existing = cart.items.find(
    (item) => item.product.toString() === productId
  );
  const newQuantity = (existing ? existing.quantity : 0) + quantity;

  if (newQuantity > product.stock) {
    throw httpError(400, `Only ${product.stock} "${product.name}" in stock`);
  }

  if (existing) existing.quantity = newQuantity;
  else cart.items.push({ product: productId, quantity });

  await cart.save();
  res.json(await loadCart(req.user._id));
};

// PUT /api/cart/:productId  { quantity }
exports.updateItem = async (req, res) => {
  const quantity = parseInt(req.body.quantity, 10);
  if (!quantity || quantity < 1) {
    throw httpError(400, "Quantity must be at least 1");
  }

  const cart = await Cart.findOne({ user: req.user._id });
  const item = cart?.items.find(
    (i) => i.product.toString() === req.params.productId
  );
  if (!item) throw httpError(404, "Item not in cart");

  const product = await Product.findById(req.params.productId);
  if (product && quantity > product.stock) {
    throw httpError(400, `Only ${product.stock} "${product.name}" in stock`);
  }

  item.quantity = quantity;
  await cart.save();
  res.json(await loadCart(req.user._id));
};

// DELETE /api/cart/:productId
exports.removeItem = async (req, res) => {
  await Cart.updateOne(
    { user: req.user._id },
    { $pull: { items: { product: req.params.productId } } }
  );
  res.json(await loadCart(req.user._id));
};

// DELETE /api/cart
exports.clearCart = async (req, res) => {
  await Cart.deleteOne({ user: req.user._id });
  res.json({ items: [] });
};
