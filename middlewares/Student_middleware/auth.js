const jwt = require('jsonwebtoken');

const authenticateStudent = (req, res, next) => {
  // Check if the Authorization header is present
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  // Get token from "Bearer <token>"
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Access denied. Token missing.' });
  }

  try {
    // Verify the token using the secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach studentUSN to the request object for further use
    req.studentUSN = decoded.studentUSN; 
    
    // Proceed to the next middleware/route handler
    next();
  } catch (err) {
    console.error('JWT verification error:', err);
    return res.status(400).json({ message: 'Invalid token' });
  }
};

module.exports = authenticateStudent;
