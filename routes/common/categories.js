const express = require("express");
const router = express.Router();
const Category = require("../../models/Category");

// Define your routes
router.get("/get_categories", async (req, res, next) => {
  try {
    const categories = await Category.find({});
    return res.status(200).json({ success: true, categories });
  } catch (error) {
    next(error);
  }
});

module.exports = router; // Ensure router is exported correctly
