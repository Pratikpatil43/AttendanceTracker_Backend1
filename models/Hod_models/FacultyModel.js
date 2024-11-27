const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  hodUsername: { type: String, required: true, ref: 'Faculty' },  // HOD's username making the request
  facultyUsername: { type: String, required: true, ref: 'Faculty' },  // Faculty's username to be added/updated/deleted
  action: { type: String, enum: ['add', 'update', 'delete'], required: true },  // CRUD action (add/update/delete)
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },  // Status of the request
  masterAdminId: { type: mongoose.Schema.Types.ObjectId, ref: 'MasterAdmin', required: true },  // MasterAdmin reviewing the request
  requestedAt: { type: Date, default: Date.now },  // Timestamp of request
  approvedAt: { type: Date },  // Timestamp when approved
  rejectedAt: { type: Date },  // Timestamp when rejected
  type: { type: String, enum: ['faculty_addition', 'faculty_removal'], required: true },  // Type of the request (e.g., add/remove faculty)
  data: { type: Object, required: true },  // Additional data related to the request
});

// Check if the model is already defined to prevent overwriting it
const Request = mongoose.models.Request || mongoose.model('Request', requestSchema);

module.exports = Request;
