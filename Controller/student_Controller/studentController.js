const Attendance = require('../../models/Faculty_models/Attendance');
const Student = require('../../models/Faculty_models/FacultyaddStudent'); // Assuming this is the Student model

// Fetch attendance data


exports.fetchAttendance = async (req, res) => {
    const { startDate, endDate } = req.query; // Extract query parameters
    const studentUSN = req.studentUSN; // Assume studentUSN is coming from authentication middleware

    if (!studentUSN) {
        return res.status(400).json({ message: 'StudentUSN is required' });
    }

    try {
        const filter = { studentUSN }; // Base filter for the student's USN

        // Check if startDate and endDate are provided
        if (startDate || endDate) {
            const start = startDate ? new Date(startDate) : new Date('1970-01-01'); // Default to earliest date
            const end = endDate ? new Date(endDate) : new Date(); // Default to today

            // Validate dates
            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                return res.status(400).json({ message: 'Invalid date format' });
            }

            // Add date range filter
            filter.attendanceDate = { $gte: start, $lte: end };
        }

        // Fetch the list of subjects for the student
        const student = await Student.findOne({ studentUSN });
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        const subjects = student.subject; // Assuming subjects is an array of subject names

        // Fetch attendance records based on the filter
        const attendanceRecords = await Attendance.find(filter).sort({ attendanceDate: -1 });

        // Handle case where no attendance records are found
        if (attendanceRecords.length === 0) {
            return res.status(404).json({ message: 'No attendance records found for the specified criteria.' });
        }

        // Group attendance data by subject
        const subjectAttendance = {};
        attendanceRecords.forEach((record) => {
            const { subject, status } = record;
            if (!subjectAttendance[subject]) {
                subjectAttendance[subject] = { totalClasses: 0, attendedClasses: 0 };
            }
            subjectAttendance[subject].totalClasses += 1;
            if (status === 'present') {
                subjectAttendance[subject].attendedClasses += 1;
            }
        });

        // Create detailed subject-wise attendance response
        const detailedAttendance = subjects.map((subject) => {
            const data = subjectAttendance[subject] || { totalClasses: 0, attendedClasses: 0 };
            const percentage = data.totalClasses
                ? ((data.attendedClasses / data.totalClasses) * 100).toFixed(2)
                : 0;
            return {
                subject,
                totalClasses: data.totalClasses,
                attendedClasses: data.attendedClasses,
                attendancePercentage: percentage,
            };
        });

        // Calculate overall attendance statistics
        const totalClasses = detailedAttendance.reduce((sum, item) => sum + item.totalClasses, 0);
        const attendedClasses = detailedAttendance.reduce((sum, item) => sum + item.attendedClasses, 0);
        const overallAttendancePercentage = totalClasses
            ? ((attendedClasses / totalClasses) * 100).toFixed(2)
            : 0;

        // Return the response
        res.status(200).json({
            detailedAttendance,
            totalClasses,
            attendedClasses,
            overallAttendancePercentage: `${overallAttendancePercentage}%`,
            message:
                overallAttendancePercentage < 75
                    ? 'Warning: Your overall attendance is below the required threshold.'
                    : 'Great job on maintaining good attendance!',
        });
    } catch (error) {
        console.error('Error fetching attendance:', error);
        res.status(500).json({ message: 'Error fetching attendance', error });
    }
};
