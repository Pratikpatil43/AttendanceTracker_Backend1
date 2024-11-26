// models/MasterAdminModel.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const masterAdminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
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

const MasterAdmin = mongoose.model('MasterAdmin', masterAdminSchema);
module.exports = MasterAdmin;
