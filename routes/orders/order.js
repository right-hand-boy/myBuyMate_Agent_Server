// dashboard.js

const express = require("express");
const { orders } = require("./orders");
const { orderDetails } = require("./orderDetail");
const { updateOrderStatus } = require("./updateOrderStatus");
const router = express.Router();

// Export the function
router.get("/orders", orders);
router.get("/order-detail", orderDetails);
router.put("/update-order-status", updateOrderStatus);

module.exports = router;
