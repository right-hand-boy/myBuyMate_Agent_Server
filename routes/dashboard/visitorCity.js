const express = require("express");
const router = express.Router();
const Sellers = require("../../models/Sellers");
const Visitor = require("../../models/Visitor");
const { default: mongoose } = require("mongoose");

const visitorCityData = async (req, res) => {
  try {
    const { sellerId } = req.query;

    // 1. Find seller
    const seller = await Sellers.findById(
      new mongoose.Types.ObjectId(sellerId)
    );
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    // 2. Aggregate visitor data by city
    const cityData = await Visitor.aggregate([
      {
        $match: {
          sellerId: seller._id,
        },
      },
      {
        $group: {
          _id: "$visitorCity", // Group by city
          totalVisitors: { $sum: 1 }, // Count total visitors per city
        },
      },
      {
        $sort: { totalVisitors: -1 }, // Optional: Sort by the number of visitors in descending order
      },
    ]);

    // 3. Prepare labels (city names) and data (visitor count)
    const labels = cityData.map((city) => city._id); // List of cities
    const data = cityData.map((city) => city.totalVisitors); // Visitor count for each city

    // 4. Prepare colors for the pie chart
    const backgroundColor = [
      "rgba(75, 192, 192, 0.6)",
      "rgba(255, 99, 132, 0.6)",
      "rgba(255, 206, 86, 0.6)",
      "rgba(54, 162, 235, 0.6)",
      // Add more colors if there are more cities
    ];

    const hoverBackgroundColor = [
      "rgba(75, 192, 192, 0.8)",
      "rgba(255, 99, 132, 0.8)",
      "rgba(255, 206, 86, 0.8)",
      "rgba(54, 162, 235, 0.8)",
      // Add more colors if there are more cities
    ];

    // 5. Prepare the pie chart data
    const pieChartData = {
      labels, // City names
      datasets: [
        {
          data, // Number of visitors from each city
          backgroundColor: backgroundColor.slice(0, labels.length), // Limit colors to the number of cities
          hoverBackgroundColor: hoverBackgroundColor.slice(0, labels.length),
        },
      ],
    };

    // 6. Send the response
    res.json(pieChartData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { visitorCityData };
