const express = require("express");
const router = express.Router();
const upload = require("../Middleware/upload");
const Product = require("../models/Product");
const ProductImage = require("../models/ProductImage");
const Seller = require("../models/Agent");
const Category = require("../models/Category");
const ProductSpecification = require("../models/ProductSpecification");
const ProductVariation = require("../models/ProductVariation");
const PricingInventory = require("../models/PricingInventory");
// PUT update product
exports.editProduct = async (req, res) => {
  try {
    const productId = req.params.id;
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
      specifications,
      variations,
    } = req.body;

    // Check seller and category existence
    const seller = await Seller.findOne({ sellerId });
    const category = await Category.findOne({ _id: categoryId });

    if (!seller)
      return res
        .status(400)
        .json({ error: `Seller with ID ${sellerId} not found.` });
    if (!category)
      return res
        .status(400)
        .json({ error: `Category with ID ${categoryId} not found.` });
    if (price <= 0)
      return res
        .status(400)
        .json({ error: "Invalid price. The price must be greater than 0." });

    // Update product basic info
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        productName,
        productDescription,
        sellerId: seller._id,
        categoryId: category._id,
        brand,
        model,
        SKU: sku,
      },
      { new: true }
    );

    if (!updatedProduct)
      return res.status(404).json({ error: "Product not found" });

    // Update specifications and variations if provided
    if (Array.isArray(specifications)) {
      await ProductSpecification.deleteMany({ productId });
      await ProductSpecification.insertMany(
        specifications.map((spec) => ({
          productId,
          specification: spec.name,
          value: spec.value,
        }))
      );
    }

    if (Array.isArray(variations)) {
      await ProductVariation.deleteMany({ productId });
      await ProductVariation.insertMany(
        variations.map((variation) => ({
          productId,
          variation: variation.name,
          value: variation.value,
        }))
      );
    }

    // Update pricing and inventory
    await PricingInventory.findOneAndUpdate(
      { productId },
      { price, inventory },
      { upsert: true }
    );

    res
      .status(200)
      .json({ message: "Product updated successfully", updatedProduct });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ error: "An unexpected error occurred." });
  }
};

exports.addProduct = async (req, res) => {
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
      specifications,
      variations,
    } = req.body;

    // Validate seller and category
    const seller = await Seller.findOne({ sellerId });
    const category = await Category.findOne({ _id: categoryId });

    if (!seller)
      return res
        .status(400)
        .json({ error: `Seller with ID ${sellerId} not found.` });
    if (!category)
      return res
        .status(400)
        .json({ error: `Category with ID ${categoryId} not found.` });
    if (price <= 0)
      return res
        .status(400)
        .json({ error: "Invalid price. The price must be greater than 0." });

    // Create the product
    const product = new Product({
      productName,
      productDescription,
      sellerId: seller._id,
      categoryId: category._id,
      brand,
      model,
      SKU: sku,
    });

    const savedProduct = await product.save();
    const productId = savedProduct._id;

    // Save specifications
    if (Array.isArray(specifications)) {
      await ProductSpecification.insertMany(
        specifications.map((spec) => ({
          productId,
          specification: spec.name,
          value: spec.value,
        }))
      );
    }

    // Save variations
    if (Array.isArray(variations)) {
      await ProductVariation.insertMany(
        variations.map((variation) => ({
          productId,
          variation: variation.name,
          value: variation.value,
        }))
      );
    }

    // Save pricing and inventory
    await PricingInventory.create({ productId, price, inventory });

    // Save product images and thumbnails
    if (req.files && req.files.productImage) {
      const productImage = new ProductImage({
        productId,
        imageName: req.files.productImage[0].originalname,
        imageType: req.files.productImage[0].mimetype,
        imageSize: req.files.productImage[0].size,
        imageContent: req.files.productImage[0].buffer,
        type: "main",
      });
      await productImage.save();
    }

    if (req.files && req.files.productThumbnails) {
      const thumbnails = req.files.productThumbnails.map((thumbnail) => ({
        productId,
        imageName: thumbnail.originalname,
        imageType: thumbnail.mimetype,
        imageSize: thumbnail.size,
        imageContent: thumbnail.buffer,
        type: "thumb",
      }));
      await ProductImage.insertMany(thumbnails);
    }

    res
      .status(201)
      .json({ message: "Product and images uploaded successfully." });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "An unexpected error occurred." });
  }
};

exports.productDetail = async (req, res) => {
  try {
    const { productId } = req.query; // Using query params

    if (!productId) {
      return res
        .status(400)
        .json({ success: false, message: "Product ID not provided." });
    }

    // Fetch product information
    const product = await Product.findById(productId);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found." });

    // Fetch product thumbnails and main image
    const productThumbnails = await ProductImage.find({
      productId,
      type: "thumb",
    });
    const Thumbnails = productThumbnails.map((thumbnail) => ({
      imageType: thumbnail?.imageType || null,
      imageContent: thumbnail?.imageContent.toString("base64") || null,
      _id: thumbnail?._id || null,
    }));

    const productImage = await ProductImage.findOne({
      productId,
      type: "main",
    });

    // Fetch seller information
    const seller = await Seller.findById(product.sellerId);

    // Prepare the final product data
    const productData = {
      productId: product._id,
      productName: product.productName,
      productDescription: product.productDescription,
      categoryId: product.categoryId,
      model: product.model,
      brand: product.brand,
      SKU: product.SKU,
      productThumbil: Thumbnails,
      productImage: {
        imageType: productImage?.imageType || null,
        imageContent: productImage?.imageContent.toString("base64") || null,
        _id: productImage?._id || null,
      },
    };

    // Fetch additional product data (specifications, variations, price, and inventory)
    const [specifications, variations, pricingInventory] = await Promise.all([
      ProductSpecification.find({ productId }),
      ProductVariation.find({ productId }),
      PricingInventory.findOne({ productId }),
    ]);

    // Return the product data
    res.status(200).json({
      ...productData,
      specifications,
      variations,
      price: pricingInventory?.price || null,
      inventory: pricingInventory?.inventory || null,
    });
  } catch (error) {
    console.error("Error fetching product:", error.message);
    res
      .status(500)
      .json({ success: false, message: "An unexpected error occurred." });
  }
};
