const express = require('express');
const router = express.Router();
const { RegisterMasterAdmin, LoginMasterAdmin,approveOrRejectRequest } = require('../MasterAdmin_Controller/MasterAdmin');
const authenticateMasterAdmin = require('../masterAdmin_middlewares/authMiddleware')

// Route to add MasterAdmin
router.post('/register', RegisterMasterAdmin);
router.post('/login', LoginMasterAdmin);

router.post('/approveRejectRequest', authenticateMasterAdmin, approveOrRejectRequest);

module.exports = router;
