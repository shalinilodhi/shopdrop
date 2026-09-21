const protect = require("./authMiddleware");
const allowRoles = require("./roleMiddleware");

// Logged in AND an admin
module.exports = [protect, allowRoles("admin")];
