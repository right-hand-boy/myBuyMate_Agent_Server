const fetch = require("node-fetch");

const Product = require("../../models/Product");
const ProductImage = require("../../models/ProductImage");
const Sellers = require("../../models/Sellers");
const Category = require("../../models/Category");
const ProductSpecification = require("../../models/ProductSpecification");
const ProductVariation = require("../../models/ProductVariation");
const PricingInventory = require("../../models/PricingInventory");

// Cloudinary configuration
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

// Function to send message to Telegram
async function sendToTelegram(
  productId,
  productName,
  brand,
  price,
  mainImageUrl
) {
  const telegramBotToken = "7321021471:AAGgkwrj1hJezseOH9dEzB6o-psVxE9lC2g";
  const chatId = "-1002409576699"; // Group ID

  // Construct the product link dynamically
  const productLink = `https://mybuymate-shop.web.app/product/${productId}`;
  const encodedProductLink = encodeURI(productLink);

  const message = ` 
  <b>${productName}</b> by <i>${brand}</i>\n
  <b>💰 Price:</b> <b>${price} ETB</b>\n
  <b>🔗 Explore Product:</b> <a href="${encodedProductLink}">Visit Product Page</a>\n
  <b>📞 Contact Support:</b> <a href="tel:+251911290020">Call Now</a> <b>+251911290020</b>\n
  <i>Discover the exclusive features and make this product yours today!</i>\n
  <i>Shop smart, shop quality!</i>
`;


  // Define the inline keyboard with a branded "View Product" button
  const inlineKeyboard = [
  [
    {
      text: "🛒 View Product Details",
      url: encodedProductLink, // Assuming this is defined and correctly encoded
    },
  ],
];


  const url = `https://api.telegram.org/bot${telegramBotToken}/sendPhoto`;

  const body = {
    chat_id: chatId,
    photo: mainImageUrl, // Send the main image as a photo
    caption: message, // Set the message as the caption
    parse_mode: "HTML", // HTML formatting
    reply_markup: {
      inline_keyboard: inlineKeyboard, // Attach the inline keyboard
    },
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    if (!data.ok) {
      console.error("Telegram error:", data.description);
    }
  } catch (error) {
    console.error("Error sending message to Telegram:", error);
  }
}

async function addProduct(req, res) {
  try {
    const {
      productName,
      productDescription,
      price,
      sellerId,
      categoryId,
      model,
      brand,
      sku,
      inventory,
      status,
    } = req.body;

    let specifications = req.body.specifications;
    if (typeof specifications === "string") {
      try {
        specifications = JSON.parse(specifications);
      } catch (err) {
        return res
          .status(400)
          .json({ error: "Invalid JSON format for specifications." });
      }
    }

    let variations = req.body.variations;
    if (typeof variations === "string") {
      try {
        variations = JSON.parse(variations);
      } catch (err) {
        return res
          .status(400)
          .json({ error: "Invalid JSON format for variations." });
      }
    }

    const seller = await Sellers.findOne({ sellerId: sellerId });
    const category = await Category.findOne({ _id: String(categoryId) });

    if (!seller) {
      return res
        .status(400)
        .json({ error: `Seller with ID ${sellerId} not found.` });
    }
    if (!category) {
      return res
        .status(400)
        .json({ error: `Category with ID ${categoryId} not found.` });
    }
    if (price <= 0) {
      return res
        .status(400)
        .json({ error: "Invalid price. The price must be greater than 0." });
    }

    const product = new Product({
      productName,
      productDescription,
      sellerId: seller._id,
      categoryId: category._id,
      brand,
      model,
      SKU: sku,
      status,
    });

    const savedProduct = await product.save();
    const { _id: productId } = savedProduct;

    if (Array.isArray(specifications)) {
      for (const spec of specifications) {
        const productSpecification = new ProductSpecification({
          productId: productId,
          specification: spec.name,
          value: spec.value,
        });
        await productSpecification.save();
      }
    }

    if (Array.isArray(variations)) {
      for (const variation of variations) {
        const productVariation = new ProductVariation({
          productId: productId,
          variation: variation.name,
          value: variation.value,
        });
        await productVariation.save();
      }
    }

    const pricingInventory = new PricingInventory({
      productId: productId,
      price,
      inventory,
    });

    await pricingInventory.save();

    // Upload main image to Cloudinary
    let mainImageUrl = "";
    if (req.files && req.files["productImage"]) {
      const imageBuffer = req.files["productImage"][0].buffer;
      mainImageUrl = await uploadToCloudinary(imageBuffer);

      const productImage = new ProductImage({
        productId: productId,
        imageUrl: mainImageUrl,
        type: "main",
      });
      await productImage.save();
    }

    // Upload thumbnail images to Cloudinary
    if (req.files && req.files["productThumbnails"]) {
      for (const thumbnail of req.files["productThumbnails"]) {
        const cloudinaryUrl = await uploadToCloudinary(thumbnail.buffer);

        const productThumbnail = new ProductImage({
          productId: productId,
          imageUrl: cloudinaryUrl,
          type: "thumb",
        });
        await productThumbnail.save();
      }
    }

    await sendToTelegram(productId, productName, brand, price, mainImageUrl);

    res
      .status(201)
      .json({ message: "Product and images uploaded successfully." });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "An unexpected error occurred." });
  }
}

module.exports = { addProduct };
