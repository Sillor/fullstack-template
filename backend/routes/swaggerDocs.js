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
                    required: ["username", "password", "email"],
                    properties: {
                        username: {
                            type: "string",
                            description: "Unique username containing only alphanumeric characters.",
                            minLength: 5,
                            maxLength: 30,
                            example: "john_doe123",
                        },
                        email: {
                            type: "string",
                            description: "A valid email address.",
                            format: "email",
                            example: "john.doe@example.com",
                        },
                        password: {
                            type: "string",
                            description: "A strong password with at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.",
                            pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#])[A-Za-z\\d@$!%*?&#]{8,}$",
                            example: "StrongP@ssw0rd!",
                        },
                    },
                },
            },
        }
    },
    apis: ["./routes/**/*.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

// Swagger UI route
router.use("/", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

module.exports = router;
