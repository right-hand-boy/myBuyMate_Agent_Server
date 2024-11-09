const express = require("express");
const router = express.Router();
const Order = require("../../models/Order");
const Notification = require("../../models/Notification"); // Import Notification model
// const sendNotification = require("../../utils/sendNotification");

// Route to update the status of an order
const updateOrderStatus = async (req, res) => {
  const { orderId, newStatus, reason } = req.body;

  try {
    // Find the order to get the userId and existing details
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const userId = order.userId; // Extract userId from the order

    // Prepare the update data
    const updateData = { status: newStatus };

    // Add the reason only if status is refunded or canceled
    if (newStatus === "refunded" || newStatus === "canceled") {
      if (!reason) {
        return res.status(400).json({
          message: "Reason is required for refunded or canceled status.",
        });
      }
      updateData.reasons = reason;
    } else {
      updateData.reasons = null; // Clear reason if not required
    }

    // Update the order status
    const updatedOrder = await Order.findByIdAndUpdate(orderId, updateData, {
      new: true, // Return the updated document
      runValidators: true, // Ensure status is valid
    });

    let notificationMessage;
    let notificationType;

    if (newStatus === "refunded" || newStatus === "canceled") {
      notificationMessage = `Your order ${orderId} has been ${newStatus}. Reason: ${reason}`;
      notificationType = "OrderFailed"; // Use "OrderFailed" for canceled or refunded
    } else if (newStatus === "completed") {
      notificationMessage = `Your order ${orderId} was completed successfully!`;
      notificationType = "OrderSuccessful";
    } else {
      notificationMessage = `The status of your order ${orderId} is now ${newStatus}.`;
      notificationType = "Order"; // General order update
    }

    // Save the notification in the database with the new type
    await Notification.create({
      userId,
      orderId,
      message: notificationMessage,
      notificationType,
      status: "unread",
      createdAt: new Date(),
    });

    // Optionally send the notification (e.g., email, push notification)
    // await sendNotification(userId, notificationMessage);

    res.status(200).json({
      message: "Order status updated and notification sent.",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { updateOrderStatus };
