const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const HOD = require('../../models/MasterAdmin_models/HodModel');  // Replace with the correct path to your HOD model

exports.HodLogin = async (req, res) => {
  const { username, password,role } = req.body;

  try {
    // Find HOD by username
    const hod = await HOD.findOne({ username }); // Use findOne instead of find
    if (!hod) return res.status(404).json({ message: 'HOD not found' });

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, hod.password);
    if (!isPasswordValid) return res.status(401).json({ message: 'Invalid credentials' });

    // Generate JWT token
    const token = jwt.sign(
      { _id: hod._id, username: hod.username, role: 'hod' },
      process.env.JWT_SECRET,
      { expiresIn: '6h' }
    );

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ message: 'Error during login', error: error.message });
  }
};
