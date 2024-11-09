// routes/notifications.js
const express = require("express");
const Notification = require("../../models/Notification");
const router = express.Router();

// Mark a notification as read
router.patch("/:id/read", async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: "Error updating notification" });
  }
});

// Get notifications for a specific seller
router.get("/:sellerId", async (req, res) => {
  try {
    const notifications = await Notification.find({
      sellerId: req.params.sellerId,
    }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: "Error fetching notifications" });
  }
});

// Get unread notification count for a specific seller
router.get("/:sellerId/unread-count", async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({
      sellerId: req.params.sellerId,
      read: false,
    });

    res.json({ unreadCount });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error fetching unread notifications count" });
  }
});

module.exports = router;
