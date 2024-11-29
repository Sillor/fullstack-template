const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models/User");

const router = express.Router();

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           description: Unique username
 *         password:
 *           type: string
 *           description: User's password
 */

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Registers a new user.
 *     description: Creates a user with a unique username and hashed password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User successfully registered.
 *       400:
 *         description: Username already exists or invalid input.
 *       500:
 *         description: Internal server error.
 */
router.post("/register", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ username, password: hashedPassword });

        return res.status(201).json({ message: "User registered successfully.", userId: newUser.id });
    } catch (error) {
        if (error.name === "SequelizeUniqueConstraintError") {
            return res.status(400).json({ message: "Username already exists." });
        }
        console.error("Error during registration:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
});

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Authenticates a user.
 *     description: Validates username and password and returns a JWT token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: Login successful.
 *       400:
 *         description: Invalid username or password.
 *       500:
 *         description: Internal server error.
 */
router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    try {
        const user = await User.findOne({ where: { username } });
        if (!user) {
            return res.status(400).json({ message: "Invalid username or password." });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid username or password." });
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        return res.status(200).json({ message: "Login successful.", token });
    } catch (error) {
        console.error("Error during login:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
});

/**
 * @swagger
 * /profile:
 *   get:
 *     summary: Fetches the authenticated user's profile.
 *     description: Requires a valid JWT token for access.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User's profile returned successfully.
 *       404:
 *         description: User not found.
 *       401:
 *         description: Unauthorized or invalid token.
 *       500:
 *         description: Internal server error.
 */
router.get("/profile", verifyToken, async (req, res) => {
    try {
        const user = await User.findByPk(req.userId, { attributes: ["id", "username"] });
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        return res.status(200).json({ message: "Welcome to your profile!", user });
    } catch (error) {
        console.error("Error fetching profile:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
});

function verifyToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
        return res.status(403).json({ message: "No token provided." });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
        return res.status(403).json({ message: "No token provided." });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Invalid token." });
        }
        req.userId = decoded.id;
        next();
    });
}

module.exports = router;
