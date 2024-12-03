const mongoose =require('mongoose');

const addedFacultySchema = new mongoose.Schema({
  hodUsername: { type: String, required: true }, // HOD's username making the request
  facultyUsername: { type: String, required: true }, // Faculty username
  password: { type: String, required: true }, // Password
  branch: { type: String, required: true }, // Faculty branch
  subject: { type: String, required: true }, // Faculty subject
  type: { type: String, required: true }, // Type of request (e.g., "create" or "update")
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },  // Status of the request
  action: { type: String, required: true }, // Action to be taken (e.g., "create" or "update")
  data: { 
    name: { type: String, required: true }, // Name of the faculty
    facultyUsername: { type: String, required: true }, // Faculty username
    password: { type: String, required: true }, // Password
    branch: { type: String, required: true }, // Branch of the faculty
    subject: { type: String, required: true } // Subject of the faculty
  },
  masterAdmin: { type: mongoose.Schema.Types.ObjectId, ref: 'MasterAdmin', required: true }, // MasterAdmin ID
}, 
{ timestamps: true }); // Store timestamps when the document is created or updated

const AddedFaculty = mongoose.model('HodRequest', addedFacultySchema);

module.exports = AddedFaculty;
