// dashboard.js

const express = require("express");
const { agentProducts } = require("./agentProducts");
const { outOfStock } = require("./outOfStock");
const { productDetail } = require("./productDetail");
const { updateProductImages } = require("./updateProductImages");
const { updateProductInformation } = require("./updateProductInformation");
const router = express.Router();
const multer = require("multer");
const { deleteProductThumbnail } = require("./deleteProductThumbnail");
const { addProduct } = require("./addProduct");
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage: storage });
// Export the function
router.get("/products", agentProducts);
router.post("/product/out-of-stock", outOfStock);
router.get("/product-detail", productDetail); // Route for updating product images

router.post(
  "/update-product-image",
  upload.single("image"),
  updateProductImages
);

router.put("/update-product-info", upload.none(), updateProductInformation);
router.delete(
  "/delete-product-thumbnail",
  upload.none(),
  deleteProductThumbnail
);
router.post(
  "/upload-product",
  upload.fields([
    { name: "productImage", maxCount: 1 },
    { name: "productThumbnails", maxCount: 10 },
  ]),
  addProduct
);

module.exports = router;
