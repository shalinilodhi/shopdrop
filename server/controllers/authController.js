const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { httpError } = require("../middleware/errorHandler");

const signToken = (user) =>
  jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

// POST /api/auth/register
exports.register = async (req, res) => {
  const { name, email, password, role, shopName, phone, address } = req.body;

  if (!name || !email || !password) {
    throw httpError(400, "Name, email and password are required");
  }
  if (password.length < 6) {
    throw httpError(400, "Password must be at least 6 characters");
  }
  // Admin accounts are created with `npm run seed`, never from the form
  const finalRole = role === "vendor" ? "vendor" : "customer";
  if (finalRole === "vendor" && !shopName) {
    throw httpError(400, "Shop name is required for vendors");
  }

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) throw httpError(400, "Email already registered");

  const user = await User.create({
    name,
    email,
    password: await bcrypt.hash(password, 10),
    role: finalRole,
    phone,
    address,
    shopName: finalRole === "vendor" ? shopName : undefined,
  });

  res.status(201).json({
    message:
      finalRole === "vendor"
        ? "Registered! An admin must approve your shop before you can sell."
        : "Registered successfully. Please login.",
    user: user.toSafeObject(),
  });
};

// POST /api/auth/login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw httpError(400, "Email and password are required");
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw httpError(400, "Invalid email or password");
  }
  if (user.isBlocked) {
    throw httpError(403, "Your account has been blocked by the admin");
  }

  res.json({
    message: "Login successful",
    token: signToken(user),
    user: user.toSafeObject(),
  });
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  res.json(req.user.toSafeObject());
};

// PUT /api/auth/me
exports.updateMe = async (req, res) => {
  const user = await User.findById(req.user._id);
  const { name, phone, address, shopName, currentPassword, newPassword } =
    req.body;

  if (name !== undefined) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (address !== undefined) user.address = address;
  if (shopName !== undefined && user.role === "vendor") {
    user.shopName = shopName;
  }

  if (newPassword) {
    if (!(await bcrypt.compare(currentPassword || "", user.password))) {
      throw httpError(400, "Current password is incorrect");
    }
    if (newPassword.length < 6) {
      throw httpError(400, "New password must be at least 6 characters");
    }
    user.password = await bcrypt.hash(newPassword, 10);
  }

  await user.save();
  res.json({ message: "Profile updated", user: user.toSafeObject() });
};
