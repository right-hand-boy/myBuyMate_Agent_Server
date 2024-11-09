const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Sellers = require("../../models/Sellers");
const ProfileImage = require("../../models/ProfileImage"); // Assuming you have a model for ProfileImage
const { check, validationResult } = require("express-validator");
const mongoose = require("mongoose"); // Make sure mongoose is required
const upload = require("../../middleware/upload"); // Ensure you have your upload middleware
const router = express.Router();
const SECRET_KEY = process.env.SECRET_KEY || "your_secret_key"; // Use environment variable

// Route to update user info
router.post("/update-user-info", upload.single("image"), async (req, res) => {
  const { agentId, fullname, email, phonenumber, storeName, location } =
    req.body;
  try {
    // Find user by agentId
    const agent = await Sellers.findById(new mongoose.Types.ObjectId(agentId));
    if (!agent) {
      return res.status(404).json({ message: "User not found" });
    }
    // Update the user information
    agent.seller_name = fullname;
    agent.email = email || agent.email;
    agent.phonenumber = phonenumber || agent.phonenumber;
    agent.seller_name = agent.seller_name;
    agent.store_name = storeName;
    agent.location = location;
    await Sellers.save();

    return res.status(200).json({
      message: "User info updated successfully.",
      agent: {
        id: agent._id,
        email: agent.email,
        phonenumber: agent.phonenumber,
        fullName: agent.seller_name,
        seller_name: agent.seller_name,
        store_name: agent.store_name,
        location: agent.location,
      },
    });
  } catch (error) {
    console.error("Error updating user info:", error);
    return res.status(500).json({ error: "Error: " + error.message });
  }
});

router.post(
  "/update-password",
  [
    check("oldPassword", "Old password is required").notEmpty(),
    check(
      "newPassword",
      "New password must be at least 6 characters long"
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const { agentId, oldPassword, newPassword } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const agent = await Sellers.findById(
        new mongoose.Types.ObjectId(agentId)
      );
      if (!agent) {
        return res.status(404).json({ message: "User not found" });
      }

      const isMatch = await bcrypt.compare(oldPassword, agent.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Old password is incorrect" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      agent.password = hashedPassword;
      await Sellers.save();

      return res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Error updating password:", error);
      return res.status(500).json({ error: "Error: " + error.message });
    }
  }
);

module.exports = router;
