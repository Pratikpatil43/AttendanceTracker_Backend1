const express = require('express');
const router = express.Router();
const { registerStudent, loginStudent } = require('../../Controller/student_Controller/authController');
const {fetchAttendance} = require('../../Controller/student_Controller/studentController')
const authenticateStudent = require('../../middlewares/Student_middleware/auth')

// Register route
router.post('/register', registerStudent);

// Login route
router.post('/login', loginStudent);

router.get('/getAttendance',authenticateStudent,fetchAttendance)

module.exports = router;
