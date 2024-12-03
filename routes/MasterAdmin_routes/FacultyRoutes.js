// routes/facultyRoutes.js
const express = require('express');
const router = express.Router();
const authenticateMasterAdmin = require('../../middlewares/masterAdmin_middlewares/authMiddleware');  // Your middleware for authentication
const {
  addFaculty,
  getFaculty,
  updateFaculty,
  removeFaculty,
} = require('../../Controller/MasterAdmin_Controller/FacultyController');  // Adjust the path if necessary

// Add Faculty
router.post('/add', authenticateMasterAdmin, addFaculty);

// Get Faculty by MasterAdmin ID
router.get('/getFaculty/:masterAdmin', authenticateMasterAdmin, getFaculty);

// Update Faculty
router.put('/update/:id', authenticateMasterAdmin, updateFaculty);

// Remove Faculty
router.delete('/remove/:id', authenticateMasterAdmin, removeFaculty);

module.exports = router;
