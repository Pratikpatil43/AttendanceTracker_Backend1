const express = require('express');
const router = express.Router();
const { RegisterMasterAdmin, LoginMasterAdmin } = require('../Controller/MasterAdmin');

// Route to add MasterAdmin
router.post('/register', RegisterMasterAdmin);
router.post('/login', LoginMasterAdmin);

module.exports = router;
