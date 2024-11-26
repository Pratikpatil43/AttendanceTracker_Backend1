const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  hodUsername: { type: String, required: true }, // HOD username
  facultyUsername: { type: String, required: true }, // Faculty username
  action: { type: String, required: true, enum: ['add', 'update', 'delete'] }, // Requested action
  status: { type: String, required: true, enum: ['pending', 'approved', 'rejected'], default: 'pending' }, // Request status
  masterAdminId: { type: mongoose.Schema.Types.ObjectId, ref: 'MasterAdmin', required: true }, // Reference to MasterAdmin
  approvedAt: { type: Date }, // Time of approval
  rejectedAt: { type: Date }, // Time of rejection
});

const Request = mongoose.model('Request', requestSchema);
module.exports = Request;
