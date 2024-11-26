const mongoose = require('mongoose');
const MasterAdmin = require('../models/MasterAdminModel'); // Reference to MasterAdmin model

// HOD schema
const hodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  branch: { type: String, required: true },
  masterAdmin: { type: mongoose.Schema.Types.ObjectId, ref: 'MasterAdmin' }  // Reference to MasterAdmin
});

// Create the model
const HOD = mongoose.model('HOD', hodSchema);

module.exports = HOD;
