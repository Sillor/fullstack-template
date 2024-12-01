const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../../models/User");
const sendResetMail = require('../../utils/mailer/mailer');
const { resetPasswordSchema, newPasswordSchema } = require("../../utils/validationSchemas");

/**
 * @swagger
 * /reset-password:
 *   post:
 *     summary: Initiates the password reset process.
 *     description: Sends a password reset email with a unique reset link to the user's registered email address.
 *     tags:
 *       - Password Management
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Registered email address of the user.
 *                 example: johndoe@example.com
 *             required:
 *               - email
 *     responses:
 *       200:
 *         description: Reset link sent successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Reset link sent successfully.
 *       404:
 *         description: The provided email address does not exist in the system.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Email not found.
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
 *   patch:
 *     summary: Resets the password using the reset token.
 *     description: Validates the reset token and updates the user's password with a new one.
 *     tags:
 *       - Password Management
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: JWT reset token received via email.
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *               newPassword:
 *                 type: string
 *                 description: The new password for the user.
 *                 example: NewP@ssword123
 *             required:
 *               - token
 *               - newPassword
 *     responses:
 *       200:
 *         description: Password reset successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password reset successfully.
 *       400:
 *         description: Invalid token, expired token, or missing input.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Token expired.
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

exports.resetPasswordRequest = async (req, res) => {
    const { error } = resetPasswordSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { email } = req.body;

    try {
        // Verify if the user exists
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: "Email not found." });
        }

        // Generate a reset token and link
        const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

        // Send the reset email
        await sendResetMail(email, "Password Reset Request", user.username, resetLink);

        return res.status(200).json({ message: "Reset link sent successfully." });
    } catch (error) {
        console.error("Error during password reset request:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
};

exports.resetPassword = async (req, res) => {
    const { error } = newPasswordSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { token, newPassword } = req.body;

    try {
        // Decode and verify the reset token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch the user based on the decoded ID
        const user = await User.findByPk(decoded.id);
        if (!user) {
            return res.status(400).json({ message: "Invalid token." });
        }

        // Hash the new password and update the user's record
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
};
