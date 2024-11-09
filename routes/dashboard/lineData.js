const express = require("express");
const router = express.Router();
const Sellers = require("../../models/Sellers");
const Order = require("../../models/Order");
const { default: mongoose } = require("mongoose");

// Mapping MongoDB $dayOfWeek numbers to actual weekday names
const dayOfWeekMap = {
  1: "Sun", // MongoDB $dayOfWeek starts at 1 for Sunday
  2: "Mon",
  3: "Tue",
  4: "Wed",
  5: "Thu",
  6: "Fri",
  7: "Sat",
};

const lineData = async (req, res) => {
  try {
    const { sellerId } = req.query;

    // 1. Find seller
    const seller = await Sellers.findById(
      new mongoose.Types.ObjectId(sellerId)
    );
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    // 2. Aggregate sales by the day of the week
    const salesData = await Order.aggregate([
      {
        $match: {
          sellerId: seller._id,
          status: "completed",
        },
      },
      {
        $group: {
          _id: { $dayOfWeek: "$createdAt" }, // Group by day of the week
          totalSalesAmount: { $sum: "$totalAmount" }, // Sum of sales for the day
        },
      },
      {
        $sort: { _id: 1 }, // Sort by day of the week (1 = Sunday, 7 = Saturday)
      },
    ]);

    // 3. Initialize daily sales for each weekday (Sun to Sat)
    const dailySales = Array(7).fill(0); // Index 0 -> Sun, 6 -> Sat

    // 4. Populate daily sales from the aggregation result
    salesData.forEach((day) => {
      const dayIndex = day._id - 1; // Convert 1-7 (Sun-Sat) to 0-6
      dailySales[dayIndex] = Number(day.totalSalesAmount).toFixed(2) || 0;
    });

    // 5. Prepare labels for weekdays
    const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // 6. Prepare the line chart data
    const lineChartData = {
      labels, // ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
      datasets: [
        {
          label: "Total Sales",
          data: dailySales, // Sales data for each weekday
          fill: false,
          backgroundColor: "rgba(234, 179, 8, 0.2)", // Yellow background
          borderColor: "rgba(234, 179, 8, 1)", // Yellow color for border
          borderWidth: 2,
        },
      ],
    };

    // 7. Send the response
    res.json(lineChartData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { lineData };
