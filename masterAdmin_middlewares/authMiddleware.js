const jwt = require('jsonwebtoken');

// Basic middleware to authenticate using JWT
const authenticateMasterAdmin = (req, res, next) => {
    // Extract the token from the 'Authorization' header
    const token = req.headers.authorization && req.headers.authorization.split(" ")[1];

    // If no token is provided, respond with an error
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        // Verify the token with the secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach decoded data to the request object for use in routes
        req.user = decoded; // Assuming the decoded token contains user info

        // Continue to the next middleware or route handler
        next();
    } catch (error) {
        // If the token is invalid, respond with an error
        return res.status(401).json({ message: "Invalid token" });
    }
};

module.exports = authenticateMasterAdmin;
