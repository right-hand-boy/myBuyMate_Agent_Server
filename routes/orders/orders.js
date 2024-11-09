const express = require("express");
const router = express.Router();
const Order = require("../../models/Order");
const User = require("../../models/User");
const { default: mongoose } = require("mongoose");

// Function to calculate the relative duration
const calculateDuration = (createdAt) => {
  const currentTime = new Date();
  const orderTime = new Date(createdAt);
  const timeDiff = Math.abs(currentTime - orderTime); // Difference in milliseconds

  const seconds = Math.floor((timeDiff / 1000) % 60);
  const minutes = Math.floor((timeDiff / (1000 * 60)) % 60);
  const hours = Math.floor((timeDiff / (1000 * 60 * 60)) % 24);
  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const months = Math.floor(days / 30); // Approximate months
  const years = Math.floor(months / 12); // Approximate years

  // Format based on the largest unit of time
  if (years > 0) {
    return years === 1 ? "1 year ago" : `${years} years ago`;
  } else if (months > 0) {
    return months === 1 ? "1 month ago" : `${months} months ago`;
  } else if (days > 0) {
    return days === 1
      ? "1 day ago"
      : days === 2
      ? " yesterday"
      : `${days} days ago`;
  } else if (hours > 0) {
    return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
  } else if (minutes > 0) {
    return minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`;
  } else {
    return seconds === 1 ? "1 second ago" : `${seconds} seconds ago`;
  }
};

// Route to get all orders filtered by sellerId with the user's name as operatedBy
const orders = async (req, res) => {
  const { sellerId } = req.query; // Get sellerId from the query parameters
  try {
    const statusMap = {
      pending: "New Order",
      shipped: "Shipped",
      completed: "Completed",
      refunded: "Refunded",
      canceled: "Canceled",
    };

    const objectedId = new mongoose.Types.ObjectId(sellerId);

    // Fetch orders from the database filtered by sellerId
    const orders = await Order.find({ sellerId: objectedId });

    // Use Promise.all to handle async calls in map
    const mappedOrders = await Promise.all(
      orders.map(async (order) => {
        const user = await User.findById(order.userId);

        return {
          id: order._id,
          orderNo: order.orderId,
          status: statusMap[order.status] || order.status,
          orderedBy: `${user.firstName} ${user.lastName}`, // Use user's first and last name
          createdAt: order.createdAt.toISOString().split("T")[1].split(".")[0], // Time in HH:MM:SS format
          duration: calculateDuration(order.createdAt), // Calculate relative duration (e.g., "2 days ago")
          amount: `${order.totalAmount.toFixed(2)}`,
        };
      })
    );
    res.json(mappedOrders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { orders };
