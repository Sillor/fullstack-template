const express = require("express");
const { User } = require("../../models/User");

/**
 * @swagger
 * /profile:
 *   get:
 *     tags:
 *       - User
 *     summary: Retrieve the authenticated user's profile
 *     description: Fetch the profile information of the currently authenticated user. Requires a valid JWT token in the Authorization header.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *           example: Bearer <JWT Token>
 *         description: Bearer token for authentication.
 *     responses:
 *       200:
 *         description: User's profile retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Welcome to your profile!
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 232f3b91-fd36-4886-a5c8-68c3dcc234ec
 *                     username:
 *                       type: string
 *                       example: johndoe
 *                     email:
 *                       type: string
 *                       example: johndoe@example.com
 *       401:
 *         description: Unauthorized - Missing or invalid token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized or invalid token.
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error.
 */
exports.getProfile = async (req, res) => {
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
};