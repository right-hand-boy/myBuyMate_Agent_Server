const Sellers = require("../../models/Sellers");
const { default: mongoose } = require("mongoose");
const PricingInventory = require("../../models/PricingInventory");
const Product = require("../../models/Product");

const topSellingProducts = async (req, res) => {
  try {
    const { sellerId } = req.query;

    // 1. Find seller by ID
    const seller = await Sellers.findById(
      new mongoose.Types.ObjectId(sellerId)
    );
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    // 2. Get all products for the seller
    const products = await Product.find({ sellerId: seller._id })
      .sort({ itemsSold: -1 }) // Sort by itemsSold (top-selling)
      .limit(5); // Limit to top 10 products

    // 3. Get pricing and inventory details for each product
    const productDetails = await Promise.all(
      products.map(async (product) => {
        const pricingInventory = await PricingInventory.findOne({
          productId: product._id,
        });

        return {
          id: product._id,
          productName: product.productName,
          price: pricingInventory ? pricingInventory.price : "N/A", // Handle case where no pricing data exists
          sold: product.itemsSold,
          total: pricingInventory
            ? pricingInventory.inventory + product.itemsSold
            : "N/A",
          status: product.status,
        };
      })
    );

    // 4. Send the response with top-selling products
    res.json(productDetails);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { topSellingProducts };
