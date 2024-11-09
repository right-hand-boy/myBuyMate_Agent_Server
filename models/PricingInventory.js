// ./model/PricingInventory.js
const mongoose = require("mongoose");

const PricingInventorySchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refence: "Products",
  },
  price: { type: Number, required: true },
  inventory: { type: Number },
});

const PricingInventory = mongoose.model(
  "PricingInventory",
  PricingInventorySchema
);

module.exports = PricingInventory;
