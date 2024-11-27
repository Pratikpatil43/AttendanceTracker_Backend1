// controllers/masterAdminController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const MasterAdmin = require('../../models/MasterAdmin_models/MasterAdminModel');  // Adjust the path as necessary
const Faculty = require('../../models/MasterAdmin_models/FacultyModel');
const loggedInHod = require('../../models/MasterAdmin_models/HodModel')
const Request = require('../../models/Hod_models/RequestModel');


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
// Approve or reject a faculty addition request
exports.approveOrRejectRequest = async (req, res) => {
  const { username, requestId, action } = req.body; // `action` is either 'approve' or 'reject'

  try {
    // Verify MasterAdmin's identity (ensure the username belongs to a valid MasterAdmin)
    // const masterAdmin = await MasterAdmin.findOne({ username });
    // if (!masterAdmin) {
    //   return res.status(403).json({ message: 'MasterAdmin not found or unauthorized.' });
    // }

    // Find the request by ID
    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found.' });
    }

    // Ensure the request is still in 'pending' state
    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request has already been processed.' });
    }

    // Process the request based on the action
    if (action === 'approve') {
      request.status = 'approved';
      request.approvedAt = new Date();

      // Extract faculty details from the request's data field
      const { name, facultyUsername, password, branch, subject } = request.data;

      // Check if all required fields are present in the request data
      if (!name || !facultyUsername || !password || !branch || !subject) {
        return res.status(400).json({ message: 'Incomplete faculty details in the request data.' });
      }

      // Check if the faculty already exists
      const existingFaculty = await Request.findOne({ username: facultyUsername });
      if (existingFaculty) {
        return res.status(400).json({ message: 'Faculty with this username already exists.' });
      }

      // Create and save the new faculty in the Faculty collection
      const newFaculty = new Faculty({
        name,
        username: facultyUsername,
        password, // Hash the password before saving
        branch,
        subject,
      });

      await newFaculty.save(); // Save the new faculty to the database
    } else if (action === 'reject') {
      request.status = 'rejected';
      request.rejectedAt = new Date();
    } else {
      return res.status(400).json({ message: 'Invalid action. Must be either "approve" or "reject".' });
    }

    // Save the updated request
    const updatedRequest = await request.save();

    // Return success response
    res.status(200).json({
      message: `Request ${action}d successfully.`,
      request: updatedRequest,
    });
  } catch (error) {
    console.error('Error processing the request:', error);
    res.status(500).json({ message: 'Failed to process the request.', error: error.message });
  }
};