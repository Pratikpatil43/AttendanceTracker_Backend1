const express = require('express');
const router = express.Router();
const { 
    RegisterMasterAdmin, 
    LoginMasterAdmin,
    approveOrRejectRequest,
    updateFacultyRequest,
    approveRemovalRequest,
    getRequests,
    getupdateRequests,
    handleAction ,
    masterAdminprofile,
    ForgotPasswordMasterAdmin
} = require('../../Controller/MasterAdmin_Controller/MasterAdmin');

const authenticateMasterAdmin = require('../../middlewares/masterAdmin_middlewares/authMiddleware')


// Route to add MasterAdmin
router.post('/register', RegisterMasterAdmin);
router.post('/login', LoginMasterAdmin);

//fetch AdminMaster logged in data
router.get('/profile',authenticateMasterAdmin, masterAdminprofile);

router.put('/forgetPassword', ForgotPasswordMasterAdmin); 






// MasterAdmin approves or rejects a request
router.post('/approveRejectRequest', authenticateMasterAdmin, approveOrRejectRequest);

router.get('/getRequests', authenticateMasterAdmin, getRequests);



router.get('/getupdateRequests', authenticateMasterAdmin, getupdateRequests);           



router.post('/updateRequest', authenticateMasterAdmin, updateFacultyRequest);

router.post('/removeRequest', authenticateMasterAdmin, approveRemovalRequest);






module.exports = router;
