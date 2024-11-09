// ./model/Review.js
const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    reference: "Products",
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    reference: "Users",
  },
  rating: { type: Number, required: true },
  review: { type: String, required: true },
  reviewerName: { type: String, required: true },
  reviewDate: { type: Date, default: Date.now },
});

const Review = mongoose.model("Reviews", ReviewSchema);
module.exports = Review;
