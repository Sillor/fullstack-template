const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { sequelize } = require("./models/User");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const swaggerDocs = require("./routes/swaggerDocs");

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to the database
sequelize
    .authenticate()
    .then(() => console.log("Database connected..."))
    .catch((err) => console.error("Unable to connect to database:", err));

// Routes
app.use("/docs", swaggerDocs);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Swagger docs available at http://localhost:${PORT}/docs`);
});