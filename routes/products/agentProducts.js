const Product = require("../../models/Product"); // Adjust path to Product model
const ProductImage = require("../../models/ProductImage"); // Adjust path to ProductImage model

// Route to fetch products by sellerId
async function agentProducts(req, res) {
  try {
    const { sellerId } = req.query;

    // Fetch products belonging to the seller
    const products = await Product.find({ sellerId })
      .select("productName productDescription status itemsSold createdAt")
      .lean();

    // For each product, fetch the corresponding image URL
    const productIds = products.map((product) => product._id);
    const productImages = await ProductImage.find({
      productId: { $in: productIds },
      type: "main",
    })
      .select("productId imageUrl")
      .lean();

    // Merge product info with its corresponding image(s)
    const productsWithImages = products.map((product) => {
      const image = productImages.find((img) =>
        img.productId.equals(product._id)
      );
      return {
        ...product,
        productImage: image ? image.imageUrl : null, // Use imageUrl if available, otherwise null
      };
    });

    res.status(200).json(productsWithImages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching products", error });
  }
}

module.exports = { agentProducts };
