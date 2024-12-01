const jwt = require("jsonwebtoken");

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

module.exports = { verifyToken };