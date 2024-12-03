const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema
const facultySchema = new Schema({
  name: { type: String, required: true },
  facultyUsername: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  branch: { type: String, required: true },
  subject: { type: String, required: true },
  masterAdmin: { 
    type: mongoose.Schema.Types.ObjectId,  // Link to MasterAdmin using ObjectId
    ref: 'MasterAdmin',
    required: true 
  }
});

// Check if the model is already defined to avoid overwriting it
const Faculty = mongoose.models.Faculty || mongoose.model('Faculty', facultySchema);

module.exports = Faculty;
