const ProductImage = require("../../models/ProductImage");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "dyvmsyecq",
  api_key: "353784313814985",
  api_secret: "OhNiOWqoVL9tU1hqc3lgTd6geqY",
});

// Function to upload buffer image to Cloudinary
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

async function updateProductImages(req, res) {
  const { productId, imageType, thumbnailId } = req.body;
  const file = req.file; // Using req.file instead of req.files

  if (!productId || !file) {
    return res.status(400).json({ message: "Missing productId or image file" });
  }

  // Validate file size and type
  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB limit
  const allowedTypes = ["image/jpeg", "image/png", "image/gif"];

  if (!allowedTypes.includes(file.mimetype)) {
    return res.status(400).json({ message: "Unsupported file format" });
  }

  if (file.size > MAX_FILE_SIZE) {
    return res.status(400).json({ message: "File size exceeds 2MB" });
  }

  try {
    let productImage;

    if (imageType === "main") {
      productImage = await ProductImage.findOne({
        productId: productId,
        type: "main",
      });

      if (!productImage) {
        return res.status(404).json({ message: "Main image not found" });
      }

      // Upload the image to Cloudinary
      const imageBuffer = file.buffer;
      const mainImageUrl = await uploadToCloudinary(imageBuffer);

      productImage.imageUrl = mainImageUrl;
    } else if (imageType === "thumbnail") {
      if (thumbnailId) {
        productImage = await ProductImage.findById(thumbnailId);

        if (!productImage) {
          return res.status(404).json({ message: "Thumbnail not found" });
        }

        // Upload thumbnail image to Cloudinary
        const imageBuffer = file.buffer;
        const thumbnailImageUrl = await uploadToCloudinary(imageBuffer);

        productImage.imageUrl = thumbnailImageUrl;
      } else {
        const newThumbnail = new ProductImage({
          productId: productId,
          imageUrl: "", // Placeholder for the image URL, to be updated later
          type: "thumb",
        });

        // Upload the image to Cloudinary for the new thumbnail
        const imageBuffer = file.buffer;
        const thumbnailImageUrl = await uploadToCloudinary(imageBuffer);
        newThumbnail.imageUrl = thumbnailImageUrl;

        await newThumbnail.save();
        return res.json({
          message: "Thumbnail added successfully",
          newThumbnail,
        });
      }
    }

    await productImage.save();
    res.json({ message: "Product image updated successfully", productImage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update product image" });
  }
}

module.exports = { updateProductImages };
