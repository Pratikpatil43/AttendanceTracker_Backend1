const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema({
  facultyUsername: { type: String, required: true, unique: true },  // Change the field name here
  name: { type: String },
  department: { type: String },
  position: { type: String },
});

module.exports = mongoose.models.Faculty || mongoose.model('Faculty', facultySchema);
