const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../../models/User");
const sendResetMail = require('../../utils/mailer/mailer');
const { resetPasswordSchema, newPasswordSchema } = require("../../utils/validationSchemas");

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
exports.resetPasswordRequest = async (req, res) => {
    const { error } = resetPasswordSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { email } = req.body;

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
};

exports.resetPassword = async (req, res) => {
    const { error } = newPasswordSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { token, newPassword } = req.body;

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
};