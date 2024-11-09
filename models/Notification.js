const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller", // Assuming you have a Seller collection
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Assuming you have a Seller collection
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    notificationType: {
      type: String,
      enum: ["Order", "OrderSuccessful", "OrderFailed", "System"],
      default: "System",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },

    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

module.exports = mongoose.model("Notification", notificationSchema);
