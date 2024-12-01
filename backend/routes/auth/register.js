const bcrypt = require("bcrypt");
const { User } = require("../../models/User");
const { registerSchema } = require("../../utils/validationSchemas");

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user.
 *     description: Creates a user account with a unique username, hashed password, and valid email address. Input is validated and stored securely.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: A unique username for the user.
 *                 example: johndoe123
 *               password:
 *                 type: string
 *                 description: A strong password for the account.
 *                 example: P@ssw0rd!
 *               email:
 *                 type: string
 *                 description: A valid email address.
 *                 example: johndoe@example.com
 *             required:
 *               - username
 *               - password
 *               - email
 *     responses:
 *       201:
 *         description: User successfully registered.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User registered successfully.
 *                 userId:
 *                   type: string
 *                   description: The unique identifier of the newly created user.
 *       400:
 *         description: Validation error, username or email already exists, or input is invalid.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Username or email already exists.
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
exports.register = async (req, res) => {
    const { error } = registerSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { username, password, email } = req.body;

    try {
        // Hash the password for secure storage
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user in the database
        const newUser = await User.create({ username, password: hashedPassword, email });

        return res.status(201).json({ message: "User registered successfully.", userId: newUser.id });
    } catch (error) {
        if (error.name === "SequelizeUniqueConstraintError") {
            // Handle unique constraint errors (e.g., duplicate username or email)
            return res.status(400).json({ message: "Username or email already exists." });
        }

        console.error("Error during registration:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
};
