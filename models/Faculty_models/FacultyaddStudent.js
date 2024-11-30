const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
    studentName: {
        type: String,
        required: true
    },
    studentUSN: {
        type: String,
        required: true,
        unique: true
    },
    isLateralEntry: {
        type: Boolean,
        required: true
    },
    branch: {
        type: String, // Add branch field
        required: true
    },
    className: {
        type: String, // Add className field
        required: true
    },
    subject: {
        type: String, // Add subject field
        required: true
    },
}, { timestamps: true });

module.exports = mongoose.model('Student', StudentSchema);
