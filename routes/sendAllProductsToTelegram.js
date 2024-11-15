const mongoose = require("mongoose");
const Product = require("../models/Product"); // Adjust the path to your Product model
const ProductImage = require("../models/ProductImage"); // Adjust the path to your ProductImage model
const PricingInventory = require("../models/PricingInventory"); // Adjust the path to your PricingInventory model
const fetch = require("node-fetch");

async function sendToTelegram(
  productId,
  productName,
  brand,
  price,
  mainImageUrl
) {
  const telegramBotToken = "7321021471:AAGgkwrj1hJezseOH9dEzB6o-psVxE9lC2g";
  const chatIds = ["-1002409576699", "-1002333013868"]; // Group and Channel IDs

  // Construct the product link dynamically
  const productLink = `https://waliamartagent.web.app/product/${productId}`;
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
        url: encodedProductLink,
      },
    ],
  ];

  const url = `https://api.telegram.org/bot${telegramBotToken}/sendPhoto`;

  for (const chatId of chatIds) {
    const body = {
      chat_id: chatId,
      photo: mainImageUrl,
      caption: message,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: inlineKeyboard,
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
        console.error(
          `Telegram error for chat ID ${chatId}:`,
          data.description
        );
      }
    } catch (error) {
      console.error(`Error sending message to chat ID ${chatId}:`, error);
    }
  }
}


async function sendAllProductsToTelegram() {
  try {
    const products = await Product.find();

    for (const product of products) {
      const mainImage = await ProductImage.findOne({
        productId: product._id,
        type: "main",
      });

      if (!mainImage) {
        console.warn(`No main image found for product: ${product.productName}`);
        continue;
      }

      const pricing = await PricingInventory.findOne({
        productId: product._id,
      });

      if (!pricing) {
        console.warn(`No pricing found for product: ${product.productName}`);
        continue;
      }

      await sendToTelegram(
        product._id,
        product.productName,
        product.brand,
        pricing.price,
        mainImage.imageUrl
      );

      console.log(`Sent product: ${product.productName} to Telegram`);
    }

    console.log("All products have been processed.");
  } catch (error) {
    console.error("Error while sending products to Telegram:", error);
  }
}

(async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/yourDatabaseName", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to MongoDB");

    // Send all products to Telegram
    await sendAllProductsToTelegram();

    mongoose.disconnect();
  } catch (error) {
    console.error("Database connection error:", error);
  }
})();
