const mongoose = require("mongoose");
const app = require("./app");
require("dotenv").config();

const { verifyConnection } = require("./utils/sendEmail");

const PORT = process.env.PORT || 5000;

// Only connect and start server if not in test mode
console.log("Environment:", process.env.NODE_ENV);
if (process.env.NODE_ENV !== "test") {
  // console.log("MongoDB URI:", process.env.MONGO_URI); // HIDDEN FOR SECURITY
  mongoose
    .connect(process.env.MONGO_URI)
    .then(async () => {
      console.log("MongoDB connected");
      await verifyConnection();
      app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
    })
    .catch((err) => console.error("MongoDB connection error:", err));
}

module.exports = app;
