const mongoose = require("mongoose");

const productImageSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
});

const ProductImage = mongoose.model("ProductImage", productImageSchema);

module.exports = ProductImage;
