const Product = require("../../models/Product");

async function outOfStock(req, res) {
  const { productId } = req.body;

  try {
    const product = await Product.findByIdAndUpdate(
      productId,
      { status: "out of stock" },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res
      .status(200)
      .json({ message: "Product marked as Out of Stock", product });
  } catch (error) {
    console.error("Error updating product status:", error);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = { outOfStock };
