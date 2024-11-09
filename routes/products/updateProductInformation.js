const Product = require("../../models/Product");
const PricingInventory = require("../../models/PricingInventory");
const ProductSpecification = require("../../models/ProductSpecification");
const ProductVariation = require("../../models/ProductVariation");
const { default: mongoose } = require("mongoose");

async function updateProductInformation(req, res) {
  const {
    productId,
    productName,
    productDescription,
    brand,
    model,
    sku,
    price,
    categoryId,
  } = req.body;
  let { status, specifications, variations, inventory } = req.body;

  try {
    // Validate required fields
    if (
      !mongoose.Types.ObjectId.isValid(productId) ||
      !mongoose.Types.ObjectId.isValid(categoryId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid productId or categoryId",
      });
    }

    if (!productName || !price || inventory == null) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Parse specifications and variations if necessary
    try {
      specifications = JSON.parse(specifications);
    } catch (e) {
      return res.status(400).json({
        success: false,
        message: "Invalid specifications format",
      });
    }

    try {
      variations = JSON.parse(variations);
    } catch (e) {
      return res.status(400).json({
        success: false,
        message: "Invalid variations format",
      });
    }

    // Update product details
    const productUpdate = await Product.findByIdAndUpdate(
      productId,
      {
        productName,
        productDescription,
        brand,
        model,
        SKU: sku,
        categoryId: new mongoose.Types.ObjectId(categoryId),
        status,
      },
      { new: true }
    );

    if (!productUpdate) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // Update pricing and inventory
    await PricingInventory.findOneAndUpdate(
      { productId },
      { price, inventory },
      { new: true, upsert: true }
    );

    // Update specifications and variations
    await ProductSpecification.deleteMany({ productId });
    if (specifications && specifications.length > 0) {
      const validSpecifications = specifications.filter(
        (spec) => spec.specification && spec.value
      );
      await ProductSpecification.insertMany(
        validSpecifications.map((spec) => ({
          productId,
          specification: spec.specification,
          value: spec.value,
        }))
      );
    }

    await ProductVariation.deleteMany({ productId });
    if (variations && variations.length > 0) {
      const validVariations = variations.filter(
        (variation) => variation.variation && variation.value
      );
      await ProductVariation.insertMany(
        validVariations.map((variation) => ({
          productId,
          variation: variation.variation,
          value: variation.value,
        }))
      );
    }

    // Fetch updated details
    const updatedPricingInventory = await PricingInventory.findOne({
      productId,
    });
    const updatedSpecifications = await ProductSpecification.find({
      productId,
    });
    const updatedVariations = await ProductVariation.find({ productId });

    // Respond with updated information
    return res.status(200).json({
      success: true,
      message: "Product information updated successfully",
      data: {
        product: productUpdate,
        pricingInventory: updatedPricingInventory,
        specifications: updatedSpecifications,
        variations: updatedVariations,
      },
    });
  } catch (error) {
    console.error("Error updating product:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}

module.exports = { updateProductInformation };
