const Student = require('../../models/Faculty_models/FacultyaddStudent'); // Import the Student model

const FacultySelection = require('../../models/Faculty_models/facultySelection'); // path to your model

exports.setFacultySelection = async (req, res) => {
    const { branch, subject, className, date } = req.body;

    // Validate input
    if (!branch || !subject || !className || !date) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        // Create new selection document
        const selection = new FacultySelection({
            branch,
            subject,
            className,
            date
        });

        // Save the selection to MongoDB
        await selection.save();

        res.status(200).json({
            message: 'Selection set successfully',
            selection: selection,
        });
    } catch (error) {
        console.error('Error saving faculty selection:', error);
        res.status(500).json({ message: 'Error saving faculty selection' });
    }
};



exports.getFacultySelection = async (req, res) => {
    try {
        // Fetch the faculty selection document from MongoDB (most recent entry)
        const selection = await FacultySelection.findOne({}).sort({ createdAt: -1 }); // Sort by creation time, get the latest selection

        if (!selection) {
            return res.status(404).json({ message: 'No selection found. Please select again.' });
        }

        // Check if the selection has expired based on your logic
        const expiryTime = 3600 * 1000; // 1 hour in milliseconds
        const currentTime = new Date().getTime();

        if (currentTime - new Date(selection.createdAt).getTime() > expiryTime) {
            // Selection has expired
            await FacultySelection.deleteOne({ _id: selection._id }); // Optionally remove expired selection
            return res.status(400).json({ message: 'Faculty selection has expired. Please select again.' });
        }

        // Return the selection if valid
        res.status(200).json({ selection });
    } catch (error) {
        console.error('Error fetching faculty selection:', error);
        res.status(500).json({ message: 'Error fetching faculty selection' });
    }
};




// Route to add students


exports.addStudent = async (req, res) => {
    const { studentName, studentUSN, isLateralEntry } = req.body;

    // Validate required fields
    if (!studentName || !studentUSN || isLateralEntry === undefined) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        // Fetch the latest faculty selection
        const facultySelection = await FacultySelection.findOne({}).sort({ createdAt: -1 });

        // Ensure selection exists
        if (!facultySelection) {
            return res.status(400).json({ message: 'Faculty selection not found. Please set the selection first.' });
        }

        const { branch, className, subject } = facultySelection;

        // Check for duplicate studentUSN
        const existingStudent = await Student.findOne({ studentUSN });
        if (existingStudent) {
            return res.status(400).json({ message: 'Student with this USN already exists.' });
        }

        // Create new student
        const newStudent = new Student({
            studentName,
            studentUSN,
            isLateralEntry,
            branch,     // Add branch
            className,  // Add className
            subject,    // Add subject
        });

        // Save to database
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