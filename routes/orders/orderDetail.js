const express = require("express");
const router = express.Router();
const Order = require("../../models/Order");
const Product = require("../../models/Product");
const ProductImage = require("../../models/ProductImage");
const User = require("../../models/User");
const mongoose = require("mongoose");

// Route to get a specific order's details, products, and product images
const orderDetails = async (req, res) => {
  const { orderId } = req.query;

  try {
    // Find the order by orderId
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Fetch user information based on the customer id from the order
    const user = await User.findById(order.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Map over the order items to get product details
    const productDetails = await Promise.all(
      order.items.map(async (item) => {
        const product = await Product.findById(item.productId);

        if (!product) {
          return { ...item, productName: "Product not found" };
        }

        // Fetch associated product images
        const productImage = await ProductImage.findOne({
          productId: product._id,
          type: "main",
        });

        return {
          ...item,
          productName: product.productName,
          productImage: productImage.imageUrl,
          quantity: item.quantity,
          price: item.price,
        };
      })
    );

    // Return the order with all product and user details
    res.json({
      id: order.orderId,
      reasons: order.reasons,
      status: order.status,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
      customer: {
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: user.phonenumber,
      },
      items: productDetails,
    });
  } catch (error) {
    console.error("Error fetching order details:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Export the function
module.exports = { orderDetails };
