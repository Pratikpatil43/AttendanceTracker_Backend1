const express = require('express');
const router = express.Router();
const attendanceController = require('../../Controller/Faculty_Controller/markAttendance');
const { authenticateFaculty } = require('../../middlewares/Faculty_middleware/auth');


// Mark attendance
// Mark attendance
router.post('/markAttendance',authenticateFaculty, attendanceController.markAttendance);

// Get attendance for students
router.get('/getAttendance',authenticateFaculty, attendanceController.getAttendance);

// Update student attendance  
router.put('/updateAttendance',authenticateFaculty, attendanceController.updateAttendance);

module.exports = router;
