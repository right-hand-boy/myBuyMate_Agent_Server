// ./model/ProductVariation.js
const mongoose = require("mongoose");

const ProductVariationSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    reference: "Products",
  },
  variation: { type: String, required: true },
  value: { type: String, required: true },
});

module.exports = mongoose.model("ProductVariation", ProductVariationSchema);
