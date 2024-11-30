const mongoose = require('mongoose');

const facultySelectionSchema = new mongoose.Schema({
    branch: { type: String, required: true },
    subject: [{ type: String, required: true }],
    className: { type: String, required: true },
    date: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now, expires: 3600 } // expires in 1 hour (3600 seconds)
});

const FacultySelection = mongoose.model('FacultySelection', facultySelectionSchema);

module.exports = FacultySelection;
