const express = require("express");
const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const {
  getStats,
  getMyProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  getMyOrders,
  updateOrderStatus,
} = require("../controllers/vendorController");

const router = express.Router();

router.use(protect, allowRoles("vendor"));

router.get("/stats", getStats);

router.get("/products", getMyProducts);
router.post("/products", addProduct);
router.put("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);

router.get("/orders", getMyOrders);
router.put("/orders/:id/status", updateOrderStatus);

module.exports = router;
