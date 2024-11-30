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

        // Verify password (plain text comparison since it's not hashed)
        if (password !== faculty.password) {
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