const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Sellers = require("../../models/Sellers");
const { check, validationResult } = require("express-validator");

const router = express.Router();
const SECRET_KEY = process.env.SECRET_KEY || "your_strong_secret_key"; // Use environment variable

router.post(
  "/login",
  [
    check("loggedIdentifer", "Email or phone number is required")
      .not()
      .isEmpty(),
    check("password", "Password is required").not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { loggedIdentifer, password } = req.body;

    try {
      let agent;
      if (String(loggedIdentifer).includes("@")) {
        agent = await Sellers.findOne({ email: loggedIdentifer });
      } else {
        agent = await Sellers.findOne({ phonenumber: loggedIdentifer });
      }

      if (agent) {
        const isMatch = await bcrypt.compare(password, agent.password); // Use `agent.password`
        if (isMatch) {
          // Generate a token (JWT)
          const token = jwt.sign({ id: agent._id }, SECRET_KEY, {
            expiresIn: "1h",
          });

          res.json({
            success: true,
            message: "Login successful.",
            agent: {
              id: agent._id,
              email: agent.email,
              phonenumber: agent.phonenumber,
              fullName: agent.seller_name,
              seller_name: agent.seller_name,
              sellerId: agent.sellerId,
              store_name: agent.store_name,
              location: agent.location,
              premium: agent.premium,
              // Exclude the password
            },
            token,
          });
        } else {
          res
            .status(401)
            .json({ success: false, message: "Incorrect password." });
        }
      } else {
        res.status(404).json({ success: false, message: "Agent not found." });
      }
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Server error.",
        error: err.message,
      });
    }
  }
);

// Fetch Agent (Me) Route
router.get("/me", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]; // Extract token from header

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY); // Use environment variable
    const agent = await Sellers.findById(decoded.id).select("-password"); // Exclude password

    if (!agent) {
      return res
        .status(404)
        .json({ success: false, message: "Agent not found" });
    }
    res.json({
      success: true,
      agent: {
        id: agent._id,
        email: agent.email,
        phonenumber: agent.phonenumber,
        fullName: agent.seller_name,
        seller_name: agent.seller_name,
        store_name: agent.store_name,
        sellerId: agent.sellerId,
        location: agent.location,
        premium: agent.premium,
      },
    });
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401).json({ success: false, message: "Invalid token" });
  }
});

module.exports = router;
