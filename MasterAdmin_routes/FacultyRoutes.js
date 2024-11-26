// routes/facultyRoutes.js
const express = require('express');
const router = express.Router();
const authenticateMasterAdmin = require('../masterAdmin_middlewares/authMiddleware');  // Your middleware for authentication
const {
  addFaculty,
  getFaculty,
  updateFaculty,
  removeFaculty,
} = require('../MasterAdmin_Controller/FacultyController');  // Adjust the path if necessary

// Add Faculty
router.post('/add', authenticateMasterAdmin, addFaculty);

// Get Faculty by MasterAdmin ID
router.get('/getFaculty', authenticateMasterAdmin, getFaculty);

// Update Faculty
router.put('/update/:id', authenticateMasterAdmin, updateFaculty);

// Remove Faculty
router.delete('/remove/:id', authenticateMasterAdmin, removeFaculty);

module.exports = router;
