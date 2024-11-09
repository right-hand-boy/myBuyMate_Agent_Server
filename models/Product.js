const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
  },
  productDescription: {
    type: String,
    required: true,
  },
  brand: {
    type: String,
    required: true,
  },
  model: {
    type: String,
    required: true,
  },
  SKU: {
    type: String,
    required: true,
  },
  likes: { type: Number, default: 0 },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "sellers",
  },
  itemsSold: { type: Number, default: 0 },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["available", "out of stock", "discontinued", "pre-order"], // Defined possible statuses
    default: "available",
  },
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
