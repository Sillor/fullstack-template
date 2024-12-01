const express = require("express");
const { User } = require("../models/User");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

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

module.exports = router;