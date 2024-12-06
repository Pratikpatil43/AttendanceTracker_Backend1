const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Student = require('../../models/Faculty_models/FacultyaddStudent'); // Main student DB
const StudentAuth = require('../../models/Student_models/studentAuth');

// Register a student
exports.registerStudent = async (req, res) => {
    const { name,studentUSN, email, password } = req.body;

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

        const existingemail = await StudentAuth.findOne({ email });
        if (existingemail) {
            return res.status(400).json({ message: 'Email id already exists.' });
        }


        // Create new student authentication record
        const newStudentAuth = new StudentAuth({
            name,
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
            { id: student._id, studentUSN: student.studentUSN},
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            studentDetails: {
                name: student.name,
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



exports.Studentprofile = async (req, res) => {
    try {
      // Get the student info from the decoded JWT token
      const student = req.studentUSN; // This contains the user data (e.g., from JWT)
  
      // Log the student data to verify if it contains the expected values
  
      // Fetch the user details from the database using the studentUSN
      const userDetails = await StudentAuth.findOne(student.studentUSN ); // Correct query
      
      // If user is not found in the database
      if (!userDetails) {
        return res.status(404).json({ message: 'Student not found' });
      }
  
      // Send the user details back in the response
      res.status(200).json({
        message: 'Profile fetched successfully',
        user: {
          name: userDetails.name,
          studentUSN: userDetails.studentUSN,
          branch: userDetails.branch,
          className: userDetails.className,
          email:userDetails.email
        },
      });
    } catch (error) {
      console.error(error); // Log the error for debugging
      res.status(500).json({ message: 'Error fetching profile', error });
    }
  };
  






  exports.ForgotPasswordStudent = async (req, res) => {
    try {
      const { studentUSN, newPassword } = req.body;
  
      // Check if the username exists
      const student = await StudentAuth.findOne({ studentUSN });
      if (!student) {
        return res.status(404).json({ message: 'student with this USN number not found.' });
      }
  
      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
  
      // Update the password directly without triggering the pre-save hook
      await StudentAuth.updateOne(
        { studentUSN }, // Find the user by username
        { $set: { password: hashedPassword } } // Update password with the hashed new password
      );
  
      // Optionally verify that the password was updated correctly
      const updatedStudent = await StudentAuth.findOne({ studentUSN });
   
  
      return res.status(200).json({ message: 'Password updated successfully. You can now log in with your new password.' });
    } catch (error) {
      console.error('Error updating password :', error.message);
      return res.status(500).json({ message: 'Internal server error.', error: error.message });
    }
  };