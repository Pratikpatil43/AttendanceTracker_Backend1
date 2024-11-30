const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Student = require('../../models/Faculty_models/FacultyaddStudent'); // Main student DB
const StudentAuth = require('../../models/Student_models/studentAuth');

// Register a student
exports.registerStudent = async (req, res) => {
    const { studentUSN, email, password } = req.body;

    if (!studentUSN || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        // Check if studentUSN exists in the main Student DB
        const existingStudent = await Student.findOne({ studentUSN });
        if (!existingStudent) {
            return res.status(404).json({ message: 'Invalid studentUSN. Registration denied.' });
        }

        // Check if already registered
        const existingAuth = await StudentAuth.findOne({ studentUSN });
        if (existingAuth) {
            return res.status(400).json({ message: 'Student is already registered.' });
        }

        // Create new student authentication record
        const newStudentAuth = new StudentAuth({
            studentUSN,
            email,
            password,
            branch: existingStudent.branch,
            className: existingStudent.className,
            subjects: existingStudent.subject,
        });

        await newStudentAuth.save();

        res.status(201).json({ message: 'Student registered successfully' });
    } catch (error) {
        console.error('Error registering student:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

// Login a student
exports.loginStudent = async (req, res) => {
    const { studentUSN, password } = req.body;

    if (!studentUSN || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        // Find student in Auth DB
        const student = await StudentAuth.findOne({ studentUSN });
        if (!student) {
            return res.status(404).json({ message: 'Invalid credentials' });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, student.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: student._id, studentUSN: student.studentUSN },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            studentDetails: {
                studentUSN: student.studentUSN,
                email: student.email,
                branch: student.branch,
                className: student.className,
                subjects: student.subjects,
            },
        });
    } catch (error) {
        console.error('Error logging in student:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};
