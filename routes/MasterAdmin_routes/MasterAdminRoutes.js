const express = require('express');
const router = express.Router();
const { RegisterMasterAdmin, LoginMasterAdmin,approveOrRejectRequest,updateFacultyRequest,approveRemovalRequest,getRequests } = require('../../Controller/MasterAdmin_Controller/MasterAdmin');
const authenticateMasterAdmin = require('../../middlewares/masterAdmin_middlewares/authMiddleware')


// Route to add MasterAdmin
router.post('/register', RegisterMasterAdmin);
router.post('/login', LoginMasterAdmin);



// MasterAdmin approves or rejects a request
router.post('/approveRejectRequest', authenticateMasterAdmin, approveOrRejectRequest);

router.get('/getRequests', authenticateMasterAdmin, getRequests);


router.post('/updateRequest', authenticateMasterAdmin, updateFacultyRequest);

router.post('/removeRequest', authenticateMasterAdmin, approveRemovalRequest);






module.exports = router;
