const Product = require("../models/Product");
const User = require("../models/User");
const { httpError } = require("../middleware/errorHandler");

// Only approved, unblocked vendors have their products on sale
const activeVendorIds = () =>
  User.find({
    role: "vendor",
    vendorStatus: "approved",
    isBlocked: false,
  }).distinct("_id");

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// GET /api/products?search=&category=&minPrice=&maxPrice=&sort=
exports.getProducts = async (req, res) => {
  const { search, category, minPrice, maxPrice, sort } = req.query;
  const query = { vendor: { $in: await activeVendorIds() } };

  if (search && search.trim()) {
    query.name = { $regex: escapeRegex(search.trim()), $options: "i" };
  }
  if (category && category.trim()) {
    query.category = category.trim();
  }
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  const sortBy =
    {
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      newest: { createdAt: -1 },
    }[sort] || { createdAt: -1 };

  const products = await Product.find(query)
    .sort(sortBy)
    .populate("vendor", "shopName address")
    .lean();

  res.json(products);
};

// GET /api/products/categories
exports.getCategories = async (req, res) => {
  const categories = await Product.find({
    vendor: { $in: await activeVendorIds() },
  }).distinct("category");
  res.json(categories.sort());
};

// GET /api/products/:id
exports.getProduct = async (req, res) => {
  const product = await Product.findById(req.params.id).populate(
    "vendor",
    "shopName address vendorStatus isBlocked"
  );
  if (
    !product ||
    !product.vendor ||
    product.vendor.vendorStatus !== "approved" ||
    product.vendor.isBlocked
  ) {
    throw httpError(404, "Product not found");
  }
  res.json(product);
};

exports.activeVendorIds = activeVendorIds;
