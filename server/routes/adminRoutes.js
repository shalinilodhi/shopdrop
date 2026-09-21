const express = require("express");
const adminAuth = require("../middleware/adminAuth");
const {
  getDashboardStats,
  getAllCustomers,
  blockCustomer,
  unblockCustomer,
  getAllVendors,
  approveVendor,
  suspendVendor,
  getAllOrders,
} = require("../controllers/adminController");

const router = express.Router();

router.use(adminAuth);

router.get("/stats", getDashboardStats);

router.get("/customers", getAllCustomers);
router.put("/customers/:id/block", blockCustomer);
router.put("/customers/:id/unblock", unblockCustomer);

router.get("/vendors", getAllVendors);
router.put("/vendors/:id/approve", approveVendor);
router.put("/vendors/:id/suspend", suspendVendor);

router.get("/orders", getAllOrders);

module.exports = router;
