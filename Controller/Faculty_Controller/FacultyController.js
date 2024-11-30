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
    const { studentUSN, isLateralEntry, studentName } = req.body;

    // Ensure isLateralEntry field is present
    if (isLateralEntry === undefined) {
        return res.status(400).json({ message: 'isLateralEntry field is required.' });
    }

    if (typeof isLateralEntry !== 'boolean') {
        return res.status(400).json({ message: 'isLateralEntry field must be a boolean value.' });
    }

    // Validate required fields
    if (!studentName) {
        return res.status(400).json({ message: 'Student name is required.' });
    }

    // Validate studentUSN based on isLateralEntry
    if (isLateralEntry) {
        // Validate for lateral entry: Only accept 2- or 3-digit numbers
        const lateralEntryPattern = /^[0-9]{2,3}$/;
        if (!studentUSN || !lateralEntryPattern.test(studentUSN)) {
            return res.status(400).json({ message: 'For lateral entry students, studentUSN must be a 2- or 3-digit number.' });
        }
    } else {
        // Validate for regular students: Ensure proper USN format
        const regularUSNPattern = /^[1-9][A-Z]{2}\d{2}[A-Z]{2}\d{3}$/;
        if (!studentUSN || !regularUSNPattern.test(studentUSN)) {
            return res.status(400).json({ message: 'For regular students, studentUSN must be a valid USN format (e.g., 1CS19CS123).' });
        }
    }

    try {
        // Fetch the latest faculty selection from MongoDB
        const facultySelection = await FacultySelection.findOne({}).sort({ createdAt: -1 });

        // Check if the faculty selection is valid
        if (!facultySelection || !facultySelection.className || !facultySelection.branch || !facultySelection.subject || !facultySelection.date) {
            return res.status(400).json({ message: 'Faculty selection is not set properly.' });
        }

        // Check for duplicate studentUSN
        const existingStudent = await Student.findOne({ studentUSN });
        if (existingStudent) {
            return res.status(400).json({ message: 'Student with this USN already exists.' });
        }

        // Prepare student data object
        const studentData = {
            studentName,
            studentUSN, // Store the validated studentUSN
            className: facultySelection.className,
            branch: facultySelection.branch,
            subject: facultySelection.subject,
            date: facultySelection.date,
            isLateralEntry, // Save the lateral entry status as a boolean
        };

        // Create the student document in the database
        const newStudent = await Student.create(studentData);

        // Respond with success
        res.status(201).json({ message: 'Student added successfully', student: newStudent });
    } catch (error) {
        console.error('Error adding student:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};


