const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  username: { type: String, required: true, ref: 'HOD' },
  Facultyusername: { type: String, required: true },
  action: { type: String, enum: ['add', 'update', 'delete'], required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  masterAdminId: { type: mongoose.Schema.Types.ObjectId, ref: 'MasterAdmin', required: true },
  requestedAt: { type: Date, default: Date.now },
  approvedAt: { type: Date },
  rejectedAt: { type: Date },
});

module.exports = mongoose.models.Request || mongoose.model('Request', requestSchema);
