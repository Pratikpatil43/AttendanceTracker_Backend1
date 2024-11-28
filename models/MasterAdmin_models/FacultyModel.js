// models/MasterAdmin_models/FacultyModel.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema
const facultySchema = new Schema({
  name: String,
  facultyUsername: { type: String, required: true, unique: true },
  password: String,  // Password will be hashed later, if necessary
  branch: String,
  subject: String,
});

// Check if the model is already defined to avoid overwriting it
const Faculty = mongoose.models.Faculty || mongoose.model('Faculty', facultySchema);

module.exports = Faculty;
