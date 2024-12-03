const express = require('express');
const router = express.Router();
const {
  addHOD,
  getMasterAdminDetails,
  getHODs,
  updateHOD,
  removeHOD
} = require('../../Controller/MasterAdmin_Controller/HodController');
const authenticateMasterAdmin = require('../../middlewares/masterAdmin_middlewares/authMiddleware')

// Add HOD
router.post('/add',authenticateMasterAdmin, addHOD);

// Get all HODs    
router.get('/getHod/:masterAdmin',authenticateMasterAdmin, getHODs);

router.get('/getAllhod',authenticateMasterAdmin, getMasterAdminDetails);


// Update HOD
router.put('/update/:id',authenticateMasterAdmin, updateHOD);

// Remove HOD
router.delete('/remove/:id',authenticateMasterAdmin, removeHOD);





module.exports = router;
