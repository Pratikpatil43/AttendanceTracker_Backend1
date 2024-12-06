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
            subject: subject.length > 0 ? subject : [],  // Ensure subject is an array
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


exports.getSubjects = async (req, res) => {
    const { branch, className } = req.query;

    try {
        // Log the incoming parameters for debugging
        console.log('Fetching subjects for branch:', branch, 'and className:', className);

        if (!branch || !className) {
            return res.status(400).json({ error: 'Branch and Class Name are required.' });
        }

        // Query the database for subjects based on branch and className
        const subjects = await FacultySelection.find({ branch, className });

        // Log the results from the database
        console.log('Found subjects:', subjects);

        // If no subjects found, return an empty array
        if (!subjects || subjects.length === 0) {
            return res.status(404).json({ subject: [] });
        }

        // Extract the 'subject' field from the documents and return them
        const subjectList = subjects.flatMap(subject => subject.subject);  // Flatten the subject arrays from each document
        return res.status(200).json({ subject: subjectList });
    } catch (error) {
        console.error('Error fetching subjects:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};




// Fetch Faculty Selection
exports.getFacultySelection = async (req, res) => {
    try {
        // Fetch all faculty selections
        const selections = await FacultySelection.find({});

        if (selections.length === 0) {
            return res.status(404).json({ message: 'No selection found. Please set a new selection.' });
        }

        // Extract distinct values for branch, class, subject, and date
        const branches = [...new Set(selections.map(selection => selection.branch))];
        const classes = [...new Set(selections.map(selection => selection.className))];
        const subject = [...new Set(selections.flatMap(selection => selection.subject))]; // Flatten the array of subjects
        const dates = [...new Set(selections.map(selection => selection.date))];

        // Respond with the distinct options for each field
        res.status(200).json({
            branches,
            classes,
            subject,
            dates
        });
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

        // Extract the last three digits of the studentUSN
        const lastThreeDigits = studentUSN.slice(-3);

        // Check if any existing student has the same last three digits in their studentUSN
        const existingStudent = await Student.findOne({ studentUSN: { $regex: lastThreeDigits + '$' } });

        if (existingStudent) {
            return res.status(400).json({ message: `A student with USN ending in ${lastThreeDigits} already exists.` });
        }

        // Create a new student document
        const newStudent = new Student({
            studentName,
            studentUSN,
            isLateralEntry,
            branch,
            className,
            subject,
            facultySelectionId: facultySelection._id, // Link the student to the faculty selection
        });

        await newStudent.save();

        res.status(201).json({
            message: 'Student added successfully',
            student: newStudent,
            facultySelection: facultySelection, // Return the associated selection
        });
    } catch (error) {
        console.error('Error adding student:', error);
        res.status(500).json({ message: 'Error adding student', error });
    }
};





exports.getStudentsBySelection = async (req, res) => {
    const { branch, className, subject } = req.body;

    if (!branch || !className || !subject) {
        return res.status(400).json({ message: 'Branch, class, and subject are required.' });
    }

    try {
        // Fetch only studentUSN and studentName based on the selection
        const students = await Student.find({ branch, className, subject })
            .select('studentUSN studentName isLateralEntry'); // Select only the necessary fields

        if (students.length === 0) {
            return res.status(404).json({ message: 'No students found for the given selection.' });
        }

        // Function to extract last 2 or 3 digits from studentUSN for sorting
        const getLastDigits = (usn) => {
            const lastDigits = usn.slice(-3); // Extract the last 3 digits by default
            return parseInt(lastDigits, 10); // Convert to integer for numerical sorting
        };

        // Sort the students based on the last digits of studentUSN
        const sortedStudents = students.sort((a, b) => {
            const lastDigitsA = getLastDigits(a.studentUSN); // Extract last 3 digits
            const lastDigitsB = getLastDigits(b.studentUSN); // Extract last 3 digits
            return lastDigitsA - lastDigitsB; // Numerical sort in ascending order
        });

        // Modify the 'isLateralEntry' field to display "Yes" or "No"
        const formattedStudents = sortedStudents.map(student => ({
            ...student.toObject(),
            isLateralEntry: student.isLateralEntry ? 'Yes' : 'No', // Check true/false and set "Yes" or "No"
        }));

        // Return the sorted and formatted student records
        res.status(200).json({ students: formattedStudents });
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ message: 'Error fetching students', error });
    }
};





// Update Student Details Using studentUSN
exports.updateStudent = async (req, res) => {
    const { studentUSN, studentName, isLateralEntry } = req.body;

    if (!studentUSN) {
        return res.status(400).json({ error: 'Student USN is required' });
    }

    try {
        // Update student data in the database
        const updatedStudent = await Student.findOneAndUpdate(
            { studentUSN }, // Match by USN
            { studentName, isLateralEntry }, // Update fields based on request
            { new: true } // Return updated document
        );

        if (!updatedStudent) {
            return res.status(404).json({ error: 'Student not found' });
        }

        res.status(200).json({
            message: 'Student updated successfully',
            student: updatedStudent,
        });
    } catch (error) {
        console.error('Error updating student:', error);
        res.status(500).json({ error: 'An error occurred while updating the student.' });
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




exports.getFacultySelected = async (req, res) => {
    try {
        // Fetch all faculty selections
        const selections = await Student.find({});

        if (selections.length === 0) {
            return res.status(404).json({ message: 'No selection found. Please set a new selection.' });
        }

        // Extract distinct values for branch, class, subject, and date
        const branches = [...new Set(selections.map(selection => selection.branch))];
        const classes = [...new Set(selections.map(selection => selection.className))];
        const subject = [...new Set(selections.flatMap(selection => selection.subject))]; // Flatten the array of subjects
        // const dates = [...new Set(selections.map(selection => selection.date))];

        // Respond with the distinct options for each field
        res.status(200).json({
            branches,
            classes,
            subject,
            // dates
        });
    } catch (error) {
        console.error('Error fetching faculty selection:', error);
        res.status(500).json({ message: 'Error fetching faculty selection.' });
    }
};