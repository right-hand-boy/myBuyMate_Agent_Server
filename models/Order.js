const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Sellers",
    required: true,
  },
  orderId: { type: Number, unique: true, required: true },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: Number,
      price: Number,
    },
  ],
  totalAmount: { type: Number },
  reasons: { type: String }, // Reason text
  status: {
    type: String,
    enum: ["pending", "shipped", "completed", "refunded", "canceled"], // Defined possible statuses
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", OrderSchema);
