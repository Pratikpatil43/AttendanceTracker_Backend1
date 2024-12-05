const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema for Faculty Update Requests
const facultyUpdateRequestSchema = new Schema({
  hodUsername: { type: String, required: true }, // HOD's username
  facultyUsername: { type: String }, // Username (cannot be updated but needs to be in the request)
  password: { type: String }, // New password (optional)
  branch: { type: String }, // New branch (optional)
  subject: { type: String }, // New subject (optional)
  action: { type: String, enum: ['add', 'update', 'remove'], required: true },  // CRUD action (add/update/delete)
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }, // Status of the request
  data: { // Data for update request
    name: { type: String }, // Name to be updated
    facultyUsername: { type: String }, // Username (cannot be updated but needs to be in the request)
    password: { type: String }, // New password if provided
    branch: { type: String }, // New branch if provided
    subject: { type: String }, // New subject if provided
  },
  masterAdmin: { type: Schema.Types.ObjectId, ref: 'MasterAdmin', required: true }, // ID of the Master Admin who will approve/reject the request
}, { timestamps: true }); // Add timestamps for creation and update time

const FacultyUpdateRequest = mongoose.models.FacultyUpdateRequest || mongoose.model('FacultyUpdateRequest', facultyUpdateRequestSchema);

module.exports = FacultyUpdateRequest;
