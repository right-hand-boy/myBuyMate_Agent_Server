const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const ProfileImage = require("../../models/ProfileImage");
const multer = require("multer");

// Configure multer
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage: storage });

// Set up your upload route
router.post("/upload", upload.single("image"), async (req, res) => {
  const { agentId } = req.body;

  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }

  const { originalname, mimetype, size, buffer } = req.file;

  try {
    // Find and delete the existing image for the agent, if any
    const existingImage = await ProfileImage.findOne({
      agentId: new mongoose.Types.ObjectId(agentId),
    });

    if (existingImage) {
      // If there is an existing image, remove it
      await ProfileImage.deleteOne({ _id: existingImage._id });
    }

    // Insert the new image into the database
    const newImage = new ProfileImage({
      agentId: new mongoose.Types.ObjectId(agentId),
      name: originalname,
      type: mimetype,
      size,
      content: buffer,
    });

    await newImage.save();
    return res.status(201).json({
      message: "Image uploaded and inserted into database successfully.",
    });
  } catch (error) {
    console.error("Error while saving image to database:", error);
    return res.status(500).json({ error: "Error: " + error.message });
  }
});

router.post("/remove-image", async (req, res) => {
  const { agentId } = req.body;
  try {
    const image = await ProfileImage.find({
      agentId: new mongoose.Types.ObjectId(agentId),
    }).sort({ date: -1 });

    if (!image || image.length === 0) {
      return res.status(404).json({ message: "Image not found for the user." });
    }
    if (image) {
      await ProfileImage.deleteOne({ _id: image[0]._id });
    }
    // Assuming image[0] is the most recent image

    res.status(200).json({ message: "profile image deleted succesfuly" });
  } catch (error) {
    return res.status(500).json({ error: "Error: " + error.message });
  }
});
router.get("/image", async (req, res) => {
  const { agentId } = req.query;
  try {
    const image = await ProfileImage.find({
      agentId: new mongoose.Types.ObjectId(agentId),
    }).sort({ date: -1 });
    if (!image || image.length === 0) {
      return res.status(200).json({ content: null, type: null });
    }
    const { content, type } = image[0];
    res.status(200).json({ content: content.toString("base64"), type });
  } catch (error) {
    return res.status(500).json({ error: "Error: " + error.message });
  }
});

module.exports = router;
