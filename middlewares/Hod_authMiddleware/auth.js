const jwt = require('jsonwebtoken');
const Faculty = require('../../models/Hod_models/FacultyModel');

// Middleware for authenticating HOD
exports.authenticateHod = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided, access denied.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token
    req.user = decoded; // Attach decoded user info to the request

    // Check if the user is HOD
    if (req.user.role !== 'HOD') {
      return res.status(403).json({ message: 'Unauthorized access as HOD' });
    }

    next(); // Allow the request to continue
  } catch (error) {
    res.status(500).json({ message: 'Authentication error', error });
  }
};
