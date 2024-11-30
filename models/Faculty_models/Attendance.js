const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
    {
        studentUSN: {
            type: String,
            required: true,
        },
        studentName: {
            type: String,
            required: true,
        },
        subject: {
            type: String,
            required: true,
        },
        branch: {
            type: String,
            required: true,
        },
        className: {
            type: String,
            required: true,
        },
        attendanceDate: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: ['present', 'absent'],
            required: true,
        },
        isLateralEntry: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;
