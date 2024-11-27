// controllers/masterAdminController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const MasterAdmin = require('../../models/MasterAdmin_models/MasterAdminModel');  // Adjust the path as necessary
const Request = require('../../models/MasterAdmin_models/RequestModel');
const Faculty = require('../../models/MasterAdmin_models/FacultyModel');
const loggedInHod = require('../../models/MasterAdmin_models/HodModel')

// Add a new MasterAdmin
// Add a new MasterAdmin
exports.RegisterMasterAdmin = async (req, res) => {
  try {
    const { name, username, password, role = 'masterAdmin' } = req.body; // Default role is 'masterAdmin'

    // Create a new MasterAdmin document
    const newMasterAdmin = new MasterAdmin({
      name,
      username,
      password, // Password will be hashed automatically in the pre-save hook
      role,     // Assign role to the new admin
    });

    // Save the new MasterAdmin to the database
    await newMasterAdmin.save();

    res.status(201).json({ message: 'Master Admin added successfully', masterAdmin: newMasterAdmin });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add Master Admin', error: error.message });
  }
};




// Login MasterAdmin
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

    // Generate JWT token with role
    const token = jwt.sign(
      {
        _id: masterAdmin._id,       // Use masterAdmin object here
        username: masterAdmin.username,  // Use masterAdmin object here
        role: masterAdmin.role,          // Include role in the token
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }  // Adjust expiration as needed
    );

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ message: 'Failed to login', error: error.message });
  }
};





// Approve or Reject Request
// Approve or Reject Request
exports.approveOrRejectRequest = async (req, res) => {
  const { username,requestId, action } = req.body;  // action: 'approve' or 'reject'
  

  try {
    // Query the `loggedInHod` model to find the HOD by username
    const loggedInHodUser = await loggedInHod.findOne({ username });

    if (!loggedInHodUser) {
      return res.status(403).json({ message: 'HOD username not found.' });
    }

    // Find the request by ID
    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found.' });
    }

    // Ensure the request is still in the 'pending' state
    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request has already been processed.' });
    }

    // Process the request approval or rejection
    if (action === 'approve') {
      request.status = 'approved';
    } else if (action === 'reject') {
      request.status = 'rejected';
    } else {
      return res.status(400).json({ message: 'Invalid action.' });
    }

    // Save the updated request
    const updatedRequest = await request.save();

    // Return the updated request
    res.status(200).json({
      message: `Request ${action}d successfully.`,
      request: updatedRequest,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error processing the request.', error });
  }
};
