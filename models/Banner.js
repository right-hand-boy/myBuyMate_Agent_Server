const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Seller", // Assuming you have a Seller collection
  },

  title: {
    type: String,
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
});

const Banner = mongoose.model("Banner", bannerSchema);
module.exports = Banner;
