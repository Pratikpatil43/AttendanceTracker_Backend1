const express = require('express');
const router = express.Router();
const {
  addHOD,
  getHODs,
  updateHOD,
  removeHOD
} = require('../Controller/HodController');
const authenticateMasterAdmin = require('../middlewares/authMiddleware')

// Add HOD
router.post('/add',authenticateMasterAdmin, addHOD);

// Get all HODs
router.get('/getHOD/:masterAdminId',authenticateMasterAdmin, getHODs);

// Update HOD
router.put('/update/:id',authenticateMasterAdmin, updateHOD);

// Remove HOD
router.delete('/remove/:id',authenticateMasterAdmin, removeHOD);

module.exports = router;
