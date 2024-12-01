const Attendance = require('../../models/Faculty_models/Attendance'); // Import the Attendance model
const Student = require('../../models/Faculty_models/FacultyaddStudent'); // Import the Student model

// Route to mark attendance
exports.markAttendance = async (req, res) => {
    const { subject, branch, className, attendanceDate, attendanceData } = req.body;

    if (!subject || !branch || !className || !attendanceDate || !attendanceData) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        // Fetch students based on branch, class, and if the student is enrolled in the provided subject
        const students = await Student.find({ branch, className, subject }).select('studentUSN studentName isLateralEntry');

        if (students.length === 0) {
            return res.status(404).json({ message: 'No students found for the given selection.' });
        }

        // Create attendance records for each student
        const attendanceRecords = [];

        // Handle students from the attendanceData
        for (let usn in attendanceData) {
            const status = attendanceData[usn];

            // Check if the student exists in the fetched list or handle manual entry like "121"
            const student = students.find(student => student.studentUSN === usn);

            if (!student && (usn.length === 3 || usn.length === 2)) {
                // If the student has a 2 or 3 digit USN, assume it's a valid entry
                attendanceRecords.push({
                    studentUSN: usn,
                    studentName: "Unknown",  // You can set it to a default name or leave it as "Unknown"
                    isLateralEntry: false,   // Adjust according to your logic
                    subject,
                    branch,
                    className,
                    attendanceDate,
                    status,
                });
            } else if (student) {
                const { studentUSN, studentName, isLateralEntry } = student;

                if (!status || !['present', 'absent'].includes(status)) {
                    throw new Error(`Invalid status for student ${studentName} (USN: ${studentUSN})`);
                }

                attendanceRecords.push(new Attendance({
                    studentUSN,
                    studentName,
                    isLateralEntry,
                    subject,
                    branch,
                    className,
                    attendanceDate,
                    status,
                }));
            }
        }

        // Bulk insert attendance records
        await Attendance.insertMany(attendanceRecords);

        res.status(200).json({ message: 'Attendance marked successfully' });
    } catch (error) {
        console.error('Error marking attendance:', error);
        res.status(500).json({ message: 'Error marking attendance', error: error.message });
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