const express = require("express");
const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const {
  checkout,
  getMyOrders,
  cancelOrder,
} = require("../controllers/orderController");

const router = express.Router();

router.use(protect, allowRoles("customer"));

router.post("/checkout", checkout);
router.get("/my", getMyOrders);
router.put("/:id/cancel", cancelOrder);

module.exports = router;
