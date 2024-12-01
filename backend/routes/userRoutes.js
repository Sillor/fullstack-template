const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models/User");
const sendResetMail = require('../utils/mailer');

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
 *         email:
 *           type: string
 *           description: User's email
 *         password:
 *           type: string
 *           description: User's password
 */

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Registers a new user.
 *     description: Creates a user with a unique username, hashed password, and valid email.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               email:
 *                 type: string
 *             required:
 *               - username
 *               - password
 *               - email
 *     responses:
 *       201:
 *         description: User successfully registered.
 *       400:
 *         description: Username, email already exists, or invalid input.
 *       500:
 *         description: Internal server error.
 */
router.post("/register", async (req, res) => {
    const { username, password, email } = req.body;

    if (!username || !password || !email) {
        return res.status(400).json({ message: "Username, password, and email are required." });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email format." });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ username, password: hashedPassword, email });

        return res.status(201).json({ message: "User registered successfully.", userId: newUser.id });
    } catch (error) {
        if (error.name === "SequelizeUniqueConstraintError") {
            return res.status(400).json({ message: "Username or email already exists." });
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
        const user = await User.findByPk(req.userId, { attributes: ["id", "username", "email"] });
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        return res.status(200).json({ message: "Welcome to your profile!", user });
    } catch (error) {
        console.error("Error fetching profile:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
});

/**
 * @swagger
 * /reset-password:
 *   post:
 *     summary: Initiates a password reset process.
 *     description: Sends a password reset email with a unique link to the user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: User's registered email address.
 *     responses:
 *       200:
 *         description: Reset link sent successfully.
 *       404:
 *         description: Email not found.
 *       500:
 *         description: Internal server error.
 *   patch:
 *     summary: Resets the password using a reset token.
 *     description: Updates the user's password if the provided reset token is valid.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: Token received via email.
 *               newPassword:
 *                 type: string
 *                 description: New password for the user.
 *     responses:
 *       200:
 *         description: Password reset successfully.
 *       400:
 *         description: Invalid token or missing input.
 *       500:
 *         description: Internal server error.
 */
router.post("/reset-password", async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email address is required." });
    }

    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: "Email not found." });
        }

        const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

        await sendResetMail(email, "Password Reset Request", user.username, resetLink);

        return res.status(200).json({ message: "Reset link sent successfully." });
    } catch (error) {
        console.error("Error during password reset request:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
});

router.patch("/reset-password", async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({ message: "Token and new password are required." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id);

        if (!user) {
            return res.status(400).json({ message: "Invalid token." });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await user.update({ password: hashedPassword });

        return res.status(200).json({ message: "Password reset successfully." });
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(400).json({ message: "Token expired." });
        }
        console.error("Error during password reset:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
});


/**
 * Middleware function to verify JWT token from the request headers.
 * 
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @returns {Object} - Returns a 403 status with a message if no token is provided.
 *                      Returns a 401 status with a message if the token is invalid.
 *                      Calls the next middleware function if the token is valid.
 */
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
