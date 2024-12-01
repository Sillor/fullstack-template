const bcrypt = require("bcrypt");
const { User } = require("../../models/User");
const { registerSchema } = require("../../utils/validationSchemas");

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
exports.register = async (req, res) => {
    const { error } = registerSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { username, password, email } = req.body;

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
};