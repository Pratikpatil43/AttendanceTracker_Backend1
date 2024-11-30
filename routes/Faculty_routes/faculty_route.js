const express = require('express');
const router = express.Router();

const {FacultyLogin}  = require('../../Controller/Faculty_Controller/authController');
const {setFacultySelection,addStudent,getFacultySelection,getStudentsBySelection,updateStudent,deleteStudent}  = require('../../Controller/Faculty_Controller/FacultyController');
const {authenticateFaculty} = require('../../middlewares/Faculty_middleware/auth')




//login for hod
router.post('/login', FacultyLogin);  


// Route to set branch, subject, class, and date
router.post('/setSelection',authenticateFaculty, setFacultySelection);

//get Faculty selection
router.get('/getSelection',authenticateFaculty, getFacultySelection);

// Route to add students 
router.post('/addStudent',authenticateFaculty, addStudent);

// Route to fetch students for attendance
router.get('/getStudents', getStudentsBySelection);

// Add new routes for updating and deleting students
router.post('/updateStudent', updateStudent);
router.post('/deleteStudent', deleteStudent);

                                      

       


module.exports = router;