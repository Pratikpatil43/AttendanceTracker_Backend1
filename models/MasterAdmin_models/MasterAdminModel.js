const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define the MasterAdmin Schema
const masterAdminSchema = new mongoose.Schema({
  masterAdminId: { 
    type: String, 
    required: true, 
    unique: true, 
    default: function() { 
      return `MA-${Math.floor(Math.random() * 1000000)}`; // Generate custom masterAdminId
    }
  },
  name: { type: String, required: true },
  role: { type: String, default: 'masterAdmin' },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  branch: { type: String },
});

// Hash password before saving
masterAdminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next(); // Only hash if the password is modified
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    return next(err);
  }
});

// Create a model using the schema
const MasterAdmin = mongoose.model('MasterAdmin', masterAdminSchema);

module.exports = MasterAdmin;
