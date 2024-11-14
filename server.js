const express = require("express");
const connectDB = require("./db/mongo");
const setupMiddleware = require("./Middleware/middleware");
const errorHandler = require("./Middleware/errorHandler");
const cors = require("cors");
const http = require("http"); // Import http to integrate socket.io

const login = require("./routes/common/login");
const agentInformation = require("./routes/account/agentInformation");
const updatePasword = require("./routes/account/updatePasword");
const Dashboard = require("./routes/dashboard/dashboard");
const Order = require("./routes/orders/order");
const Products = require("./routes/products/products");
const ProfileImage = require("./routes/account/profileImage");
const Categories = require("./routes/common/categories");
const Banners = require("./routes/promotion/promotion");
const Notifications = require("./routes/notifications/notifications");

const app = express();
const server = http.createServer(app); // Create an HTTP server
require("dotenv").config();

// Middleware setup
setupMiddleware(app);
app.use(
  cors({
    origin: "http://mybuymate-shop.web.app",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);
connectDB();

app.use("/", login);
app.use("/", Categories);
app.use("/", ProfileImage);
app.use("/", agentInformation);
app.use("/", updatePasword);
app.use("/dashboard", Dashboard);
app.use("/manage", Order);
app.use("/", Banners);
app.use("/", Products);
app.use("/notifications", Notifications);

// Global error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
