const express = require('express');
const router = express.Router();

const { HodLogin } = require('../../Controller/Hod_Controller/authController');
const {getAllRequests, createRequest,HodAdminprofile } = require('../../Controller/Hod_Controller/HodController');

const {authenticateHod,roleCheckMiddleware} = require('../../middlewares/Hod_authMiddleware/auth');  // Your middleware for authentication
const authenticateMasterAdmin = require('../../middlewares/masterAdmin_middlewares/authMiddleware')
const {
  addFacultyHod,
  getFacultyHod,
  updateFacultyHod,
  removeFacultyHod,
} = require('../../Controller/Hod_Controller/FacultyController');  // Adjust the path if necessary

//login for hod
router.post('/login', HodLogin);                   

// Add Faculty
router.post('/addfaculty', authenticateHod, addFacultyHod);
// Get Faculty by MasterAdmin ID
router.get('/getFaculty', authenticateHod, getFacultyHod);

router.get('/viewprofile', authenticateHod, HodAdminprofile);

// Update Faculty
router.put('/update/:id', authenticateHod, updateFacultyHod);
// Remove Faculty
router.delete('/remove/:id', authenticateHod, removeFacultyHod);






// Create a request to perform an action on a faculty member
router.post('/createRequest',authenticateHod,  createRequest);  

// View all requests made by the HOD
router.get('/requests', authenticateHod, getAllRequests);

                                      

       


module.exports = router;