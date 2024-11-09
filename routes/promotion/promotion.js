const express = require("express");
const multer = require("multer");
const Banner = require("../../models/Banner"); // Your MongoDB Banner model
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const router = express.Router();

// Set up multer storage
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage: storage });

// Cloudinary upload function
async function uploadToCloudinary(imageBuffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "product_images" }, // Optional: specify a folder
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          reject(new Error("Failed to upload image to Cloudinary."));
        } else {
          resolve(result.secure_url); // Return the image URL
        }
      }
    );
    stream.end(imageBuffer); // Pass the buffer data to the upload stream
  });
}

// POST route to create a banner
router.post("/banners", upload.single("image"), async (req, res) => {
  const { sellerId, title, action } = req.body;

  if (!req.file) {
    return res.status(400).json({ error: "Image file is required" });
  }

  try {
    // Upload image to Cloudinary and get the URL
    const imageUrl = await uploadToCloudinary(req.file.buffer);

    const banner = new Banner({
      sellerId: new mongoose.Types.ObjectId(sellerId),
      title,
      action,
      imageUrl, // Store the Cloudinary URL instead of the image content
    });

    await banner.save();
    res.status(201).json({ message: "Banner created successfully", banner });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to create banner" });
  }
});

// GET route to retrieve all banners for a specific seller
router.get("/banners/:sellerId", async (req, res) => {
  const { sellerId } = req.params;

  try {
    const banners = await Banner.find({ sellerId });

    // Format the response to include necessary fields
    const formattedBanners = banners.map((banner) => ({
      _id: banner._id,
      title: banner.title,
      action: banner.action,
      imageUrl: banner.imageUrl, // Return the Cloudinary URL
    }));

    res.status(200).json(formattedBanners);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch banners" });
  }
});

// PATCH route to update a banner
router.patch("/banners/:id", upload.single("image"), async (req, res) => {
  const { id } = req.params;
  const { title, action, sellerId } = req.body;

  // Ensure the sellerId matches the one in the banner document
  const banner = await Banner.findById(id);
  if (banner && banner.sellerId.toString() !== sellerId) {
    return res
      .status(403)
      .json({ error: "You do not have permission to edit this banner." });
  }

  const updateData = { title, action };

  try {
    // If there's a new image, upload it to Cloudinary
    if (req.file) {
      updateData.imageUrl = await uploadToCloudinary(req.file.buffer);
    }

    const updatedBanner = await Banner.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedBanner) {
      return res.status(404).json({ error: "Banner not found" });
    }

    res.status(200).json({
      message: "Banner updated successfully",
      updatedBanner,
    });
  } catch (error) {
    console.error("Error updating banner:", error);
    res.status(500).json({ error: "Failed to update banner" });
  }
});
router.delete("/banners/:id", async (req, res) => {
  const { id } = req.params; // Get banner ID from URL parameters
  try {
    // Find the banner by ID and delete it
    const deletedBanner = await Banner.findByIdAndDelete(id);

    // Check if the banner was found and deleted
    if (!deletedBanner) {
      return res.status(404).json({ error: "Banner not found" });
    }

    res
      .status(200)
      .json({ message: "Banner deleted successfully", deletedBanner });
  } catch (error) {
    console.error("Error deleting banner:", error);
    res.status(500).json({ error: "Failed to delete banner" });
  }
});
module.exports = router;
