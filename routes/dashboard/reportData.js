const Sellers = require("../../models/Sellers"); // Seller model
const Visitor = require("../../models/Visitor"); // Visitor model
const Order = require("../../models/Order"); // Order model
const mongoose = require("mongoose");

// Utility function to calculate percentage change
const calculateChange = (current, previous) => {
  if (previous === 0) return current === 0 ? "0" : "+100";
  return ((current - previous) / previous) * 100;
};

// Dashboard route for report data
const reportData = async (req, res) => {
  const today = new Date();
  const startOfToday = new Date(today.setUTCHours(0, 0, 0, 0)); // Start of the day in UTC
  const endOfToday = new Date(today.setUTCHours(23, 59, 59, 999)); // End of today in UTC
  const startOfYesterday = new Date(
    new Date().setUTCDate(today.getUTCDate() - 1)
  ); // Start of yesterday in UTC

  try {
    const { sellerId } = req.query;

    // 1. Find seller by ID
    const seller = await Sellers.findById(
      new mongoose.Types.ObjectId(sellerId)
    );
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    // 2. Today's visitors
    const todayVisitorCount = await Visitor.countDocuments({
      sellerId: seller._id,
      visitDate: { $gte: startOfToday, $lte: endOfToday },
    });

    // 3. Today's total sales, total orders, and revenue
    const todaySales = await Order.aggregate([
      {
        $match: {
          sellerId: seller._id,
          status: "completed",
          createdAt: { $gte: startOfToday },
        },
      },
      {
        $group: {
          _id: null,
          totalSalesAmount: { $sum: "$totalAmount" },
          totalOrders: { $sum: 1 },
        },
      },
    ]);

    const todayTotalSales =
      todaySales.length > 0 && todaySales[0].totalSalesAmount
        ? todaySales[0].totalSalesAmount
        : 0;
    const todayTotalOrders =
      todaySales.length > 0 ? todaySales[0].totalOrders : 0;
    const todayRevenue = todayTotalSales * 0.1;

    // 4. Yesterday's visitors
    const yesterdayVisitorCount = await Visitor.countDocuments({
      sellerId: seller._id,
      visitDate: { $gte: startOfYesterday, $lt: startOfToday },
    });

    // 5. Yesterday's total sales
    const yesterdaySales = await Order.aggregate([
      {
        $match: {
          sellerId: seller._id,
          status: "completed",
          createdAt: { $gte: startOfYesterday, $lt: startOfToday },
        },
      },
      {
        $group: {
          _id: null,
          totalSalesAmount: { $sum: "$totalAmount" },
          totalOrders: { $sum: 1 },
        },
      },
    ]);

    const yesterdayTotalSales =
      yesterdaySales.length > 0 && yesterdaySales[0].totalSalesAmount
        ? yesterdaySales[0].totalSalesAmount
        : 0;
    const yesterdayTotalOrders =
      yesterdaySales.length > 0 ? yesterdaySales[0].totalOrders : 0;
    const yesterdayRevenue = yesterdayTotalSales * 0.1;

    // 6. Calculate percentage changes
    const visitorChange = calculateChange(
      todayVisitorCount,
      yesterdayVisitorCount
    );
    const salesChange = calculateChange(todayTotalSales, yesterdayTotalSales);
    const revenueChange = calculateChange(todayRevenue, yesterdayRevenue);
    const orderChange = calculateChange(todayTotalOrders, yesterdayTotalOrders);

    // 7. Send response
    res.json([
      {
        title: "Today's Sale",
        value: `${Number(todayTotalSales).toFixed(2)} ETB`,
        change: Number(salesChange).toFixed(2),
      },
      {
        title: "Today Total Orders",
        value: todayTotalOrders,
        change: Number(orderChange).toFixed(2),
      },
      {
        title: "Revenue",
        value: Number(todayRevenue).toFixed(2),
        change: Number(revenueChange).toFixed(2),
      },
      {
        title: "Visitors",
        value: todayVisitorCount,
        change: Number(visitorChange).toFixed(2),
      },
    ]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { reportData };
