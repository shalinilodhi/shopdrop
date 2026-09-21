const express = require("express");
const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const {
  getCart,
  addToCart,
  updateItem,
  removeItem,
  clearCart,
} = require("../controllers/cartController");

const router = express.Router();

router.use(protect, allowRoles("customer"));

router.get("/", getCart);
router.post("/", addToCart);
router.delete("/", clearCart);
router.put("/:productId", updateItem);
router.delete("/:productId", removeItem);

module.exports = router;
