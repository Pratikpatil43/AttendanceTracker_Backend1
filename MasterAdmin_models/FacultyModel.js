// models/FacultyModel.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const facultySchema = new mongoose.Schema({
  name: { type: String, required: true },  // Name of the faculty
  username: { type: String, required: true, unique: true },  // Unique username for faculty login
  password: { type: String, required: true },  // Password for the faculty
  branch: { type: String, required: true },  // Branch the faculty belongs to (e.g., CSE, ECE, etc.)
  subject: { type: String, required: true },  // Subject the faculty is teaching
});

// Hash the password before saving it
facultySchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next(); // Only hash the password if it's modified
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    return next(err);
  }
});

const Faculty = mongoose.model('Faculty', facultySchema);
module.exports = Faculty;
