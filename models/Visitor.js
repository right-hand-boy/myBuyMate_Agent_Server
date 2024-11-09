const mongoose = require("mongoose");

const visitorSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Sellers", // Reference to the Trader model
  },

  visitorIp: {
    type: String,
    required: true,
  },
  visitorCity: {
    type: String,
    required: true,
  },
  visitDate: {
    type: Date,
    default: Date.now,
  },
  lastUpdated: { type: Date, default: Date.now },
});

const Visitor = mongoose.model("visitors", visitorSchema);
module.exports = Visitor;
