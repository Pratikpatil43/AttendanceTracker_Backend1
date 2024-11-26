const express = require('express');
const router = express.Router();
const {
  addHOD,
  getHODs,
  updateHOD,
  removeHOD
} = require('../MasterAdmin_Controller/HodController');
const authenticateMasterAdmin = require('../masterAdmin_middlewares/authMiddleware')

// Add HOD
router.post('/add',authenticateMasterAdmin, addHOD);

// Get all HODs
router.get('/getHOD/:masterAdminId',authenticateMasterAdmin, getHODs);

// Update HOD
router.put('/update/:id',authenticateMasterAdmin, updateHOD);

// Remove HOD
router.delete('/remove/:id',authenticateMasterAdmin, removeHOD);





module.exports = router;
