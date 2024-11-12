const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const Sellers = require("../../models/Sellers"); // Adjust path as necessary

// Route to update password
router.post("/update-password", async (req, res) => {
  const { oldPassword, newPassword, userId } = req.body;

  try {
    // Find the user by userId
    const seller = await Sellers.findOne({ sellerId: userId });
    if (!seller) {
      return res.status(404).json({ message: "Agent not found" });
    }

    // Check if the old password is correct
    const isMatch = await bcrypt.compare(oldPassword, seller.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the password in the database
    seller.password = hashedPassword;
    await seller.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
