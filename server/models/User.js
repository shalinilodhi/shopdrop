const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "vendor", "customer"],
      default: "customer",
    },
    phone: { type: String, trim: true, default: "" },
    address: { type: String, trim: true, default: "" },

    // Admin can block a customer
    isBlocked: { type: Boolean, default: false },

    // Vendor-only fields
    shopName: { type: String, trim: true },
    vendorStatus: {
      type: String,
      enum: ["pending", "approved", "suspended"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// Never send the password hash to the client
userSchema.methods.toSafeObject = function () {
  const user = this.toObject();
  delete user.password;
  if (user.role !== "vendor") {
    delete user.shopName;
    delete user.vendorStatus;
  }
  return user;
};

module.exports = mongoose.model("User", userSchema);
