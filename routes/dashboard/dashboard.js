// dashboard.js

const express = require("express");
const router = express.Router();
const { reportData } = require("./reportData");
const { barData } = require("./barData");
const { lineData } = require("./lineData");
const { visitorData } = require("./visitor");
const { visitorCityData } = require("./visitorcity");
const { topSellingProducts } = require("./topSellingProducts");

// Export the function
router.get("/report-data", reportData);
router.get("/bar-data", barData);
router.get("/line-data", lineData);
router.get("/visitor-data", visitorData);
router.get("/visitor-city-data", visitorCityData);
router.get("/top-selling-products", topSellingProducts);

module.exports = router;
