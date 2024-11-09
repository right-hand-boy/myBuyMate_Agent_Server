const Sellers = require("../../models/Sellers"); // Seller model
const Order = require("../../models/Order"); // Assuming you have an Order model
const { default: mongoose } = require("mongoose");

// Helper function to get dates for the last 7 days
const getLast7Days = () => {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - i);
    days.push(date);
  }
  return days;
};

// Helper function to format date labels like 'Nov 5'
const formatLabel = (date) => {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

// Dashboard

const barData = async (req, res) => {
  try {
    const { sellerId } = req.query;

    // 1. Find seller
    const seller = await Sellers.findById(
      new mongoose.Types.ObjectId(sellerId)
    );
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    // 2. Get last 7 days' dates and formatted labels
    const last7Days = getLast7Days();
    const labels = last7Days.map(formatLabel);

    // 3. Initialize arrays to store daily data
    const dailyOrders = Array(7).fill(0);
    const dailySales = Array(7).fill(0);

    // 4. Loop through each day and get data for orders and sales
    for (let i = 0; i < 7; i++) {
      const startOfDay = new Date(last7Days[i].setUTCHours(0, 0, 0, 0));
      const endOfDay = new Date(last7Days[i].setUTCHours(23, 59, 59, 999));

      // Count orders and sales for each day
      const salesData = await Order.aggregate([
        {
          $match: {
            sellerId: seller._id,
            status: "completed",
            createdAt: { $gte: startOfDay, $lte: endOfDay },
          },
        },
        {
          $group: {
            _id: null,
            totalSalesAmount: { $sum: 1 }, // Sum of totalAmount
            totalOrders: { $sum: 1 }, // Count of orders
          },
        },
      ]);

      // If sales data exists, store it in the arrays
      if (salesData.length > 0) {
        dailySales[i] = salesData[0].totalSalesAmount || 0;
        dailyOrders[i] = salesData[0].totalOrders || 0;
      }
    }

    // 5. Respond with the formatted data for bar chart
    const barChartData = {
      labels, // Date labels for the last 7 days
      datasets: [
        {
          label: "Number Of Orders",
          data: dailyOrders,
          backgroundColor: "rgba(234, 179, 8, 0.6)", // Yellow color matching button
          borderColor: "rgba(234, 179, 8, 1)", // Yellow color for border
          borderWidth: 1,
        },
        {
          label: "Number Of Sales",
          data: dailySales,
          backgroundColor: "rgba(234, 179, 8, 0.3)", // Yellow color matching button
          borderColor: "rgba(234, 179, 8, 1)", // Yellow color for border
          borderWidth: 1,
        },
      ],
    };

    // 6. Send the response
    res.json(barChartData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { barData };
