const { Sequelize, DataTypes } = require("sequelize");
const dotenv = require("dotenv");

dotenv.config();

// Initialize database connection details
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: "mysql",
    }
);

// The User model represents a user in the application with the following attributes:
// - id: a unique identifier for the user
// - email: the user's unique email
// - username: the user's unique username
// - password: the user's password

const User = sequelize.define("User", {
    id: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

// Synchronize the database
(async () => {
    try {
        await sequelize.sync({ alter: true });
        console.log("Database synced and User table created");
    } catch (err) {
        console.error("Error syncing database:", err);
    }
})();

module.exports = { sequelize, User };
