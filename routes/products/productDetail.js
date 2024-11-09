const ProductImage = require("../../models/ProductImage");
const Review = require("../../models/Review");
const ProductSpecification = require("../../models/ProductSpecification");
const ProductVariation = require("../../models/ProductVariation");
const PricingInventory = require("../../models/PricingInventory");
const Sellers = require("../../models/Sellers");
const Product = require("../../models/Product");
const mongoose = require("mongoose");
async function productDetail(req, res) {
  try {
    const { productId } = req.query; // Assuming `productId` is passed as a query parameter

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID not provided.",
      });
    }

    // Fetch product details along with the seller, images, reviews, specifications, variations, and pricing/inventory
    const productData = await Product.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(productId) } },
      {
        $lookup: {
          from: "sellers",
          localField: "sellerId",
          foreignField: "_id",
          as: "seller",
        },
      },
      { $unwind: { path: "$seller", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "productimages",
          let: { id: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$productId", "$$id"] } } },
            {
              $group: {
                _id: "$type",
                images: { $push: { id: "$_id", imageUrl: "$imageUrl" } },
              },
            },
          ],
          as: "images",
        },
      },
      {
        $lookup: {
          from: "reviews",
          let: { id: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$productId", "$$id"] } } },
            {
              $project: {
                _id: 1,
                review: 1,
                rating: 1,
                reviewerName: 1,
                reviewDate: 1,
              },
            },
          ],
          as: "reviews",
        },
      },
      {
        $lookup: {
          from: "productspecifications",
          localField: "_id",
          foreignField: "productId",
          as: "specifications",
        },
      },
      {
        $lookup: {
          from: "productvariations",
          localField: "_id",
          foreignField: "productId",
          as: "variations",
        },
      },
      {
        $lookup: {
          from: "pricinginventories",
          localField: "_id",
          foreignField: "productId",
          as: "pricingInventory",
        },
      },
      {
        $unwind: {
          path: "$pricingInventory",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          productId: "$_id",
          productName: 1,
          productDescription: 1,
          categoryId: 1,
          model: 1,
          brand: 1,
          status: 1,
          SKU: 1,
          seller: 1,
          productThumbil: {
            $filter: {
              input: "$images",
              as: "image",
              cond: { $eq: ["$$image._id", "thumb"] },
            },
          },
          productImage: {
            $filter: {
              input: "$images",
              as: "image",
              cond: { $eq: ["$$image._id", "main"] },
            },
          },
          reviews: 1,
          specifications: 1,
          variations: 1,
          price: "$pricingInventory.price",
          inventory: "$pricingInventory.inventory",
        },
      },
    ]);

    if (!productData || productData.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    // Send the response with the product details
    res.status(200).json({
      success: true,
      data: { ...productData[0] },
    });
  } catch (error) {
    console.error("Error fetching product:", error.message);
    res.status(500).json({
      success: false,
      message: "An unexpected error occurred.",
    });
  }
}

module.exports = { productDetail };
