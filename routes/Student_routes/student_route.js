const express = require('express');
const router = express.Router();
const { registerStudent, loginStudent,Studentprofile,ForgotPasswordStudent } = require('../../Controller/student_Controller/authController');
const {fetchAttendance} = require('../../Controller/student_Controller/studentController')
const authenticateStudent = require('../../middlewares/Student_middleware/auth')

// Register route
router.post('/register', registerStudent);

// Login route
router.post('/login', loginStudent);

router.put('/forgetpassword', ForgotPasswordStudent);


router.get('/viewprofile',authenticateStudent, Studentprofile);


router.get('/getAttendance',authenticateStudent,fetchAttendance)

module.exports = router;
