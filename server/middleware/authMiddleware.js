const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.split(" ")[1] : null;

  if (!token) {
    return res.status(401).json({ message: "Please login first" });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return res.status(401).json({ message: "Session expired, login again" });
  }

  const user = await User.findById(decoded.userId).select("-password");
  if (!user) {
    return res.status(401).json({ message: "Account no longer exists" });
  }
  if (user.isBlocked) {
    return res.status(403).json({ message: "Your account has been blocked" });
  }

  req.user = user;
  next();
};

module.exports = protect;
