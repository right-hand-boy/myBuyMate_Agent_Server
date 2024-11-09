const mongoose = require("mongoose");

// Define a schema for categories
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create a model based on the schema
const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
