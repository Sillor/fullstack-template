const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { sequelize } = require("./models/User");
const usersRouter = require("./routes/users/router");
const authRouter = require("./routes/auth/router");
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
app.use("/api/users", usersRouter);
app.use("/api/auth", authRouter);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Swagger docs available at http://localhost:${PORT}/docs`);
});