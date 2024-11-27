const jwt = require('jsonwebtoken');
const Faculty = require('../../models/Hod_models/FacultyModel');

// Middleware for authenticating HOD
exports.authenticateHod = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(403).json({ message: "Access Denied" });

  try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // Attach user info to the request
      next();
  } catch (error) {
      return res.status(403).json({ message: "Invalid or expired token" });
  }
};
