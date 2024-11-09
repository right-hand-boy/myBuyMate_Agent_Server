// ./model/ProductSpecification.js
const mongoose = require("mongoose");

const ProductSpecificationSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    reference: "Products",
  },
  specification: { type: String, required: true },
  value: { type: String, required: true },
});

module.exports = mongoose.model(
  "ProductSpecification",
  ProductSpecificationSchema
);
