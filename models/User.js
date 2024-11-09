const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, // Ensure email is unique
      lowercase: true, // Convert email to lowercase
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
  },
  { timestamps: true }
); // Automatically create createdAt and updatedAt fields

module.exports = mongoose.model("User", userSchema);
