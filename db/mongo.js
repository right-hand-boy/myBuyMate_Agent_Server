const mongoose = require("mongoose");

const uri =
  "mongodb+srv://developer:Q0kRZKcCNPHE2SIK@mybuymate.zs006.mongodb.net/myDatabase?retryWrites=true&w=majority";

const connectDB = async () => {
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB Atlas.");
  } catch (err) {
    console.error("Failed to connect to MongoDB Atlas:", err);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
