const ProductImage = require("../../models/ProductImage"); // Import the ProductImage model

async function deleteProductThumbnail(req, res) {
  const { thumbnailId } = req.query; // Get thumbnailId from query parameters

  try {
    // Find and delete the thumbnail by ID
    const deletedThumbnail = await ProductImage.findByIdAndDelete(thumbnailId);

    if (!deletedThumbnail) {
      return res.status(404).json({ message: "Thumbnail not found" });
    }

    res.status(200).json({ message: "Thumbnail deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting thumbnail", error });
  }
}

module.exports = { deleteProductThumbnail };
