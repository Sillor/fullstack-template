const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");

const router = express.Router();

// Swagger Configuration
const swaggerOptions = {
    swaggerDefinition: {
        openapi: "3.0.0",
        info: {
            title: "User Authentication API",
            version: "1.0.0",
            description: "API documentation for user registration, login, and profile access.",
            contact: {
                name: "Developer Support",
                email: "support@example.com",
            },
        },
        servers: [
            {
                url: "http://localhost:3100/api",
                description: "Development server",
            },
        ],
    },
    apis: ["./routes/*.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

// Swagger UI route
router.use("/", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

module.exports = router;
