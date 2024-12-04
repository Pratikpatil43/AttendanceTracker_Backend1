const jwt = require('jsonwebtoken');

// Middleware to authenticate and check the role and username
const authenticateMasterAdmin = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', ''); // Extract token from the header

  if (!token) {
    return res.status(401).json({ message: 'Authorization token is required.' });
  }

  try {
    const secretKey = process.env.JWT_SECRET || 'your-secret-key';  // Ensure the secret key is correct

    // Verify the token
    const decoded = jwt.verify(token, secretKey);

    // Add decoded info (including role and username) to the request object
    req.user = decoded;

    // Ensure the logged-in user is a MasterAdmin
    if (decoded.role !== 'masterAdmin') {
      return res.status(403).json({ message: 'Access denied. You do not have the required role.' });
    }

    // Ensure that the username in the token matches the username from the MasterAdmin request body (optional)
    if (req.user.username && req.user.username !== decoded.username) {
      return res.status(403).json({ message: 'Not authorized. You are not the MasterAdmin.' });
    }

    next();  // Proceed to the next middleware or route handler
  } catch (error) {
    console.error('JWT verification failed:', error.message);
    return res.status(401).json({ message: 'Invalid or expired token.please login ' });
  }
};

module.exports = authenticateMasterAdmin;
