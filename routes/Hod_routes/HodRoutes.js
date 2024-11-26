const express = require('express');
const router = express.Router();
const {getAllRequests,createRequest} = require('../../Controller/Hod_Controller/HodController');
const { authenticateHod } = require('../../middlewares/Hod_authMiddleware/auth');
const {HodLogin} = require('../../Controller/Hod_Controller/authController');
const {getAllFaculties} = require('../../Controller/Hod_Controller/HodController');

// Create a request to perform an action on a faculty member
router.post('/createRequest',authenticateHod,  createRequest);  


// View all requests made by the HOD
router.get('/requests', authenticateHod, getAllRequests);

router.post('/login', HodLogin);                                        
router.get('/getall',authenticateHod,  getAllFaculties);  
       


module.exports = router;
