const jwt = require('jsonwebtoken'); // For generating tokens
const bcrypt = require('bcrypt'); // For password hashing (optional)
const Faculty = require('../../models/MasterAdmin_models/FacultyModel'); // Adjust path to your Faculty model



exports.FacultyLogin = async (req, res) => {
    const { facultyUsername, password } = req.body;

    try {
        // Check if the faculty exists in the database
        const faculty = await Faculty.findOne({ facultyUsername });
        if (!faculty) {
            return res.status(404).json({ message: 'Faculty not found' });
        }

        // Compare provided password with the stored hashed password
        const isPasswordValid = await bcrypt.compare(password, faculty.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        // Generate a JWT token
        const token = jwt.sign(
            { id: faculty._id, role: 'faculty' }, // Payload
            process.env.JWT_SECRET || 'your_jwt_secret', // Secret key
            { expiresIn: '1h' } // Token expiration
        );

        // Return the token to the client
        res.status(200).json({
            message: 'Faculty logged in successfully',
            token,
        });
    } catch (error) {
        console.error('Error during faculty login:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};





exports.ForgotPasswordFaculty = async (req, res) => {
    try {
      const { facultyUsername, newPassword } = req.body;
  
      // Check if the username exists
      const masterAdmin = await Faculty.findOne({ facultyUsername });
      if (!masterAdmin) {
        return res.status(404).json({ message: 'Faculty with this username not found.' });
      }
  
      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
  
      // Update the password directly without triggering the pre-save hook
      await Faculty.updateOne(
        { facultyUsername }, // Find the user by username
        { $set: { password: hashedPassword } } // Update password with the hashed new password
      );
  
      // Optionally verify that the password was updated correctly
      const updatedFaculty = await Faculty.findOne({ facultyUsername });
   
  
      return res.status(200).json({ message: 'Password updated successfully. You can now log in with your new password.' });
    } catch (error) {
      console.error('Error updating password for Faculty:', error.message);
      return res.status(500).json({ message: 'Internal server error.', error: error.message });
    }
  };