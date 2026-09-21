const express = require("express");
const {
  getProducts,
  getCategories,
  getProduct,
} = require("../controllers/productController");

const router = express.Router();

// Public: anyone can browse
router.get("/", getProducts);
router.get("/categories", getCategories);
router.get("/:id", getProduct);

module.exports = router;
