const Student = require('../../models/Faculty_models/FacultyaddStudent');
const FacultySelection = require('../../models/Faculty_models/facultySelection');

// Set Faculty Selection
exports.setFacultySelection = async (req, res) => {
    const { branch, className, subject, date } = req.body;

    // Log the request body for debugging
    console.log(req.body);

    if (!branch || !className || !subject || !Array.isArray(subject) || !date) {
        return res.status(400).json({ message: 'Branch, class, subjects, and date are required.' });
    }

    try {
        const selection = new FacultySelection({
            branch,
            className,
            subject, // Save multiple subjects
            date
        });

        await selection.save();
        res.status(200).json({
            message: 'Selection set successfully',
            selection
        });
    } catch (error) {
        console.error('Error saving selection:', error);
        res.status(500).json({ message: 'Error saving selection' });
    }
};




// Fetch Faculty Selection
exports.getFacultySelection = async (req, res) => {
    try {
        const selection = await FacultySelection.findOne({}).sort({ createdAt: -1 });

        if (!selection) {
            return res.status(404).json({ message: 'No selection found. Please set a new selection.' });
        }

        const expiryTime = 30 * 60 * 1000; // 30 minutes in milliseconds
        const currentTime = new Date().getTime();

        if (currentTime - new Date(selection.createdAt).getTime() > expiryTime) {
            await FacultySelection.deleteOne({ _id: selection._id });
            return res.status(400).json({ message: 'Selection has expired. Please set a new selection.' });
        }

        res.status(200).json({ selection });
    } catch (error) {
        console.error('Error fetching faculty selection:', error);
        res.status(500).json({ message: 'Error fetching faculty selection.' });
    }
};

// Add Students
exports.addStudent = async (req, res) => {
    const { studentName, studentUSN, isLateralEntry } = req.body;

    // Validate required fields
    if (!studentName || !studentUSN || isLateralEntry === undefined) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        // Fetch the latest faculty selection
        const facultySelection = await FacultySelection.findOne({}).sort({ createdAt: -1 });

        if (!facultySelection) {
            return res.status(400).json({ message: 'Faculty selection not found. Please set the selection first.' });
        }

        const { branch, className, subject } = facultySelection;

        // Ensure subjects exist in the selection
        if (!subject || subject.length === 0) {
            return res.status(400).json({ message: 'No subjects found in the faculty selection.' });
        }

        // Check for existing student
        const existingStudent = await Student.findOne({ studentUSN });

        if (existingStudent) {
            // If student exists, append new subjects, avoiding duplicates
            const updatedSubjects = [...new Set([...existingStudent.subject, ...subject])];
            existingStudent.subject = updatedSubjects;
            await existingStudent.save();

            return res.status(200).json({
                message: 'Student updated with new subjects successfully',
                student: existingStudent,
            });
        }

        // Create a new student document
        const newStudent = new Student({
            studentName,
            studentUSN,
            isLateralEntry,
            branch,
            className,
            subject,
        });

        await newStudent.save();

        res.status(201).json({ message: 'Student added successfully', student: newStudent });
    } catch (error) {
        console.error('Error adding student:', error);
        res.status(500).json({ message: 'Error adding student', error });
    }
};





//getStudents for attendance
exports.getStudentsBySelection = async (req, res) => {
    const { branch, className, subject } = req.body;

    if (!branch || !className || !subject) {
        return res.status(400).json({ message: 'Branch, class, and subject are required.' });
    }

    try {
        // Fetch only studentUSN and studentName
        const students = await Student.find({ branch, className, subject })
            .select('studentUSN studentName'); // Select only the necessary fields

        if (students.length === 0) {
            return res.status(404).json({ message: 'No students found for the given selection.' });
        }

        res.status(200).json({ message: 'Students fetched successfully', students });
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ message: 'Error fetching students', error });
    }
};




// Update Student Details Using studentUSN
exports.updateStudent = async (req, res) => {
    const { studentUSN, studentName, isLateralEntry } = req.body;

    // Validate required fields
    if (!studentUSN || !studentName || isLateralEntry === undefined) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        // Find the student by studentUSN
        const student = await Student.findOne({ studentUSN });

        // Check if student exists
        if (!student) {
            return res.status(404).json({ message: 'Student not found.' });
        }

        // Update student details
        student.studentName = studentName;
        student.isLateralEntry = isLateralEntry;

        // Save updated student
        await student.save();

        res.status(200).json({ message: 'Student updated successfully', student });
    } catch (error) {
        console.error('Error updating student:', error);
        res.status(500).json({ message: 'Error updating student', error });
    }
};

// Delete Student Using studentUSN
exports.deleteStudent = async (req, res) => {
    const { studentUSN } = req.body;

    // Validate required field
    if (!studentUSN) {
        return res.status(400).json({ message: 'Student USN is required.' });
    }

    try {
        // Find and delete the student by studentUSN
        const student = await Student.findOneAndDelete({ studentUSN });

        // Check if student exists
        if (!student) {
            return res.status(404).json({ message: 'Student not found.' });
        }

        res.status(200).json({ message: 'Student deleted successfully', student });
    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({ message: 'Error deleting student', error });
    }
};