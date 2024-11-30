const express = require('express');
const router = express.Router();

const {FacultyLogin}  = require('../../Controller/Faculty_Controller/authController');
const {setFacultySelection,addStudent,getFacultySelection}  = require('../../Controller/Faculty_Controller/FacultyController');
const {authenticateFaculty} = require('../../middlewares/Faculty_middleware/auth')




//login for hod
router.post('/login', FacultyLogin);  


// Route to set branch, subject, class, and date
router.post('/setSelection',authenticateFaculty, setFacultySelection);

//get Faculty selection
router.get('/getSelection',authenticateFaculty, getFacultySelection);

// Route to add students 
router.post('/addStudent',authenticateFaculty, addStudent);

                                      

       


module.exports = router;