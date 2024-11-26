// controllers/masterAdminController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const MasterAdmin = require('../MasterAdmin_models/MasterAdminModel');  // Adjust the path as necessary
const Request = require('../MasterAdmin_models/RequestModel');
const Faculty = require('../MasterAdmin_models/FacultyModel');

// Add a new MasterAdmin
exports.RegisterMasterAdmin = async (req, res) => {
  try {
    const { name, username, password } = req.body;

    // Create a new MasterAdmin document
    const newMasterAdmin = new MasterAdmin({
      name,
      username,
      password, // Will be hashed automatically in the pre-save hook
    });

    // Save the new MasterAdmin to the database
    await newMasterAdmin.save();

    res.status(201).json({ message: 'Master Admin added successfully', masterAdmin: newMasterAdmin });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add Master Admin', error: error.message });
  }
};




// Login MasterAdmin
exports.LoginMasterAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find MasterAdmin by username
    const masterAdmin = await MasterAdmin.findOne({ username });
    if (!masterAdmin) {
      return res.status(404).json({ message: 'Master Admin not found' });
    }

    // Compare the password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, masterAdmin.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: masterAdmin._id, username: masterAdmin.username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // Token expiration time
    );

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ message: 'Failed to login', error: error.message });
  }
};






// MasterAdminController.js
// MasterAdmin approves or rejects the request
exports.approveOrRejectRequest = async (req, res) => {
  const { requestId, status } = req.body; // status will be 'approved' or 'rejected'

  try {
    // Find the request by ID
    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Ensure the MasterAdmin is the one approving/rejecting
    if (request.masterAdminId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to perform this action' });
    }

    // Update the status of the request
    request.status = status;
    if (status === 'approved') {
      request.approvedAt = Date.now();
    } else if (status === 'rejected') {
      request.rejectedAt = Date.now();
    }

    await request.save();

    // If approved, allow HOD to perform CRUD action on the faculty
    if (status === 'approved') {
      const faculty = await Faculty.findOne({ username: request.facultyUsername });
      if (!faculty) {
        return res.status(404).json({ message: 'Faculty not found' });
      }

      if (request.action === 'add') {
        // HOD can add the faculty - logic to add a faculty
      } else if (request.action === 'update') {
        // HOD can update faculty - logic to update a faculty
      } else if (request.action === 'delete') {
        // HOD can delete faculty - logic to delete a faculty
      }
    }

    res.status(200).json({ message: 'Request processed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error processing request', error });
  }
};
