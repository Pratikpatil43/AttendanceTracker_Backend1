const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    studentName: { 
        type: String, 
        required: true 
    },
    studentUSN: { 
        type: String,
        unique: true,
        required: function () {
            return !this.isLateralEntry; // Required only if not lateral entry
        },
        validate: {
            validator: function (value) {
                if (this.isLateralEntry) {
                    // Allow studentUSN for lateral entry to be a 2- or 3-digit number
                    return /^[0-9]{2,3}$/.test(value || "");
                }
                // Regular students must follow the proper USN format
                return /^[1-9][A-Z]{2}\d{2}[A-Z]{2}\d{3}$/.test(value);
            },
            message: function (props) {
                if (this.isLateralEntry) {
                    return 'For lateral entry students, studentUSN must be a 2- or 3-digit number.';
                }
                return 'For regular students, studentUSN must follow the USN format (e.g., 1CS19CS123).';
            }
        }
    },
    isLateralEntry: { 
        type: Boolean, 
        required: true 
    }
});

module.exports = mongoose.model('Student', studentSchema);
