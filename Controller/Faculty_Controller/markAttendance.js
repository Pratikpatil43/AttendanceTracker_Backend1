const Attendance = require('../../models/Faculty_models/Attendance'); // Import the Attendance model
const Student = require('../../models/Faculty_models/FacultyaddStudent'); // Import the Student model

// Route to mark attendance
exports.markAttendance = async (req, res) => {
    const { subject, branch, className, attendanceDate, attendanceData } = req.body;

    if (!subject || !branch || !className || !attendanceDate || !attendanceData) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        // Fetch students based on branch, class, and subject, including isLateralEntry field
        const students = await Student.find({ branch, className, subject }).select('studentUSN studentName isLateralEntry');

        if (students.length === 0) {
            return res.status(404).json({ message: 'No students found for the given selection.' });
        }

        // Iterate over students and attendance data and save it
        for (let i = 0; i < students.length; i++) {
            const { studentUSN, studentName, isLateralEntry } = students[i];
            const status = attendanceData[studentUSN]; // This will hold the status for each student
            
            console.log(`Checking attendance for student: ${studentName} (USN: ${studentUSN})`);
            console.log(`Status: ${status}`); // Log the status being used
            
            // If the status is not valid, return an error
            if (!status || !['present', 'absent'].includes(status)) {
                return res.status(400).json({ message: `Invalid status for student ${studentName} (USN: ${studentUSN})` });
            }

            // Create new attendance record with the isLateralEntry field
            const newAttendance = new Attendance({
                studentUSN,
                studentName,
                isLateralEntry, // Include isLateralEntry in the attendance record
                subject,
                branch,
                className,
                attendanceDate,
                status,
            });

            // Save attendance record to the database
            await newAttendance.save();
        }

        res.status(200).json({ message: 'Attendance marked successfully' });
    } catch (error) {
        console.error('Error marking attendance:', error);
        res.status(500).json({ message: 'Error marking attendance', error });
    }
};





// Route to fetch attendance
exports.getAttendance = async (req, res) => {
    const { subject, branch, className, attendanceDate } = req.body;

    if (!subject || !branch || !className || !attendanceDate) {
        return res.status(400).json({ message: 'Subject, branch, class, and date are required.' });
    }

    try {
        // Fetch attendance records for the given criteria
        const attendanceRecords = await Attendance.find({ 
            subject, 
            branch, 
            className, 
            attendanceDate 
        }).select('studentUSN studentName status'); // Fetch only necessary details

        if (attendanceRecords.length === 0) {
            return res.status(404).json({ message: 'No attendance records found for the given selection.' });
        }

        // Function to extract last 2 or 3 digits from studentUSN
        const getLastDigits = (usn) => {
            const lastDigits = usn.slice(-3); // By default, extract the last 3 digits
            return parseInt(lastDigits, 10); // Convert to integer for numerical sorting
        };

        // Sort the records based on the last digits of studentUSN (either 2 or 3 digits)
        const sortedRecords = attendanceRecords.sort((a, b) => {
            const lastDigitsA = getLastDigits(a.studentUSN); // Extract last 3 digits by default
            const lastDigitsB = getLastDigits(b.studentUSN); // Extract last 3 digits by default
            return lastDigitsA - lastDigitsB; // Numerical sort in ascending order
        });

        // Return the sorted attendance records
        res.status(200).json({ attendanceRecords: sortedRecords });
    } catch (error) {
        console.error('Error fetching attendance:', error);
        res.status(500).json({ message: 'Error fetching attendance', error });
    }
};






// Route to update student attendance
exports.updateAttendance = async (req, res) => {
    const { studentUSN, subject, branch, className, attendanceDate, status } = req.body;

    if (!studentUSN || !subject || !branch || !className || !attendanceDate || !status) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        // Find the attendance record by studentUSN, subject, branch, class, and date
        const attendance = await Attendance.findOneAndUpdate(
            { studentUSN, subject, branch, className, attendanceDate },
            { status },
            { new: true } // Return the updated document
        );

        // Check if the attendance record was found
        if (!attendance) {
            return res.status(404).json({ message: 'Attendance record not found.' });
        }

        res.status(200).json({ message: 'Attendance updated successfully', attendance });
    } catch (error) {
        console.error('Error updating attendance:', error);
        res.status(500).json({ message: 'Error updating attendance', error });
    }
};

