const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const studentAuthSchema = new mongoose.Schema({
    studentUSN: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/.+@.+\..+/, 'Please enter a valid email address'],
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    branch: {
        type: String,
        required: true,
    },
    className: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    subjects: {
        type: [String], // Array of subjects
        required: true,
    },
});

// Hash password before saving
studentAuthSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

const StudentAuth = mongoose.model('StudentAuth', studentAuthSchema);
module.exports = StudentAuth;
