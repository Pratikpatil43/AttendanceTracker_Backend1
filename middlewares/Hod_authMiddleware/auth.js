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


exports.roleCheckMiddleware = (requiredRole='hod') => {
  return (req, res, next) => {
    if (!req.user || req.user.role !== hod.requiredRole) {
      return res.status(403).json({ message: "Access denied. You do not have the required role." });
    }
    next();
  };
};
