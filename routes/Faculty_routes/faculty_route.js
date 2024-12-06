const express = require('express');
const router = express.Router();

const { FacultyLogin,ForgotPasswordFaculty,facultyAdminprofile } = require('../../Controller/Faculty_Controller/authController');
const { setFacultySelection, addStudent, getFacultySelection,getFacultySelected,getSubjects, getStudentsBySelection, updateStudent, deleteStudent } = require('../../Controller/Faculty_Controller/FacultyController');
const { authenticateFaculty } = require('../../middlewares/Faculty_middleware/auth');
const { markAttendance, getAttendance, updateAttendance } = require('../../Controller/Faculty_Controller/markAttendance');

// Faculty Login Route
router.post('/login', FacultyLogin);

// Set Faculty Selection Route
router.post('/setSelection', authenticateFaculty, setFacultySelection);

router.get('/getsubjects', authenticateFaculty, getSubjects); 

router.get('/viewprofile', authenticateFaculty, facultyAdminprofile);

// Get Faculty Selection Route
router.get('/getSelection', authenticateFaculty, getFacultySelection);

router.get('/getfacultySelection', authenticateFaculty, getFacultySelected);


// Add Student Route
router.post('/addStudent', authenticateFaculty, addStudent);
router.put('/forgetpassword', ForgotPasswordFaculty);


// Get Students Route
router.post('/getStudents',authenticateFaculty, getStudentsBySelection);

// Update and Delete Student Routes
router.put('/updateStudent',authenticateFaculty, updateStudent);
router.delete('/deleteStudent',authenticateFaculty, deleteStudent);




module.exports = router;
