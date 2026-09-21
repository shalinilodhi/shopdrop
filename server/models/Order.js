const mongoose = require("mongoose");

// One order per vendor: a checkout with products from two shops
// creates two orders, so each vendor accepts its own.
const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        // Snapshot so the order stays correct if the product changes
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
    totalAmount: { type: Number, required: true },
    shippingAddress: { type: String, required: true },
    phone: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "delivered", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
