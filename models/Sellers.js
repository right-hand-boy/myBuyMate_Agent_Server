const mongoose = require("mongoose");

const sellerSchema = new mongoose.Schema(
  {
    seller_name: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    store_name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, // Ensure email is unique
      lowercase: true, // Convert email to lowercase
    },
    sellerId: {
      type: Number,
      required: true,
      unique: true, // Ensure email is unique
    },
    password: {
      type: String,
      required: true,
    },
    phonenumber: {
      type: String,
      required: true,
      unique: true, // Ensure phone number is unique
    },
    premium: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Sellers = mongoose.model("Sellers", sellerSchema);
module.exports = Sellers;
