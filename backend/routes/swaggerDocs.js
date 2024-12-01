const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
const dotenv = require("dotenv");

dotenv.config();

const router = express.Router();

// Swagger Configuration
const swaggerOptions = {
    swaggerDefinition: {
        openapi: "3.0.0",
        info: {
            title: "Template API",
            version: "1.0.0",
            description: "API documentation for the template backend server.",
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT}/api`,
                description: "Development server",
            },
        ],
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
            schemas: {
                User: {
                    type: "object",
                    required: ["username", "password"],
                    properties: {
                        username: {
                            type: "string",
                            description: "Unique username",
                        },
                        email: {
                            type: "string",
                            description: "User's email",
                        },
                        password: {
                            type: "string",
                            description: "User's password",
                        },
                    },
                },
            },
        },
    },
    apis: ["./routes/**/*.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

// Swagger UI route
router.use("/", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

module.exports = router;
