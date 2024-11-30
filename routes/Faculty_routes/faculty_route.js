const express = require('express');
const router = express.Router();

const { FacultyLogin } = require('../../Controller/Faculty_Controller/authController');
const { setFacultySelection, addStudent, getFacultySelection, getStudentsBySelection, updateStudent, deleteStudent } = require('../../Controller/Faculty_Controller/FacultyController');
const { authenticateFaculty } = require('../../middlewares/Faculty_middleware/auth');
const { markAttendance, getAttendance, updateAttendance } = require('../../Controller/Faculty_Controller/markAttendance');

// Faculty Login Route
router.post('/login', FacultyLogin);

// Set Faculty Selection Route
router.post('/setSelection', authenticateFaculty, setFacultySelection);

// Get Faculty Selection Route
router.get('/getSelection', authenticateFaculty, getFacultySelection);

// Add Student Route
router.post('/addStudent', authenticateFaculty, addStudent);

// Get Students Route
router.get('/getStudents',authenticateFaculty, getStudentsBySelection);

// Update and Delete Student Routes
router.post('/updateStudent',authenticateFaculty, updateStudent);
router.post('/deleteStudent',authenticateFaculty, deleteStudent);




module.exports = router;
