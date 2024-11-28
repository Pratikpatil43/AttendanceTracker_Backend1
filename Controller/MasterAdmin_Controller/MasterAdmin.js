// controllers/masterAdminController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const MasterAdmin = require('../../models/MasterAdmin_models/MasterAdminModel');  // Adjust the path as necessary
const Faculty = require('../../models/MasterAdmin_models/FacultyModel');
const loggedInHod = require('../../models/MasterAdmin_models/HodModel')
const Request = require('../../models/Hod_models/RequestModel');
const FacultyUpdateRequest = require('../../models/Hod_models/FacultyUpdateRequest');



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







// MasterAdmin approves or rejects a request
exports.approveOrRejectRequest = async (req, res) => {
  const { requestId, action } = req.body; // `action` should be 'approve' or 'reject'

  try {
    // Find the request by ID
    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found.' });
    }

    // Ensure the request has not already been processed
    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request has already been processed.' });
    }

    if (action === 'approve') {
      request.status = 'approved';
      request.approvedAt = new Date();

      // Extract data from the request for adding a new faculty
      const { name, facultyUsername, password, branch, subject } = request;

      // Check if a faculty member with the same username already exists
      const existingFaculty = await Faculty.findOne({ facultyUsername });
      if (existingFaculty) {
        return res.status(400).json({
          message: 'A faculty member with this username already exists.',
        });
      }

      // Add the new faculty
      const newFaculty = new Faculty({
        name,
        facultyUsername,
        password, // Make sure to hash the password in production
        branch,
        subject,
      });

      await newFaculty.save();
    } else if (action === 'reject') {
      request.status = 'rejected';
      request.rejectedAt = new Date();
    } else {
      return res.status(400).json({ message: 'Invalid action. Use "approve" or "reject".' });
    }

    // Save the updated request status
    const updatedRequest = await request.save();

    res.status(200).json({
      message: `Request ${action}d successfully.`,
      request: updatedRequest,
    });
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ message: 'Failed to process request.', error: error.message });
  }
};



exports.updateFacultyRequest = async (req, res) => {
  try {
    const { requestId, action } = req.body;

    // Find the update request
    const request = await FacultyUpdateRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found.' });
    }

    if (action === 'approve') {
      // Find the faculty to update by facultyUsername
      const faculty = await Faculty.findOne({ facultyUsername: request.facultyUsername });
      if (!faculty) {
        return res.status(404).json({ message: 'Faculty not found.' });
      }

      // Update the faculty document with the new data from the request
      const updatedFaculty = await Faculty.findOneAndUpdate(
        { facultyUsername: request.facultyUsername }, // Find faculty by facultyUsername
        {
          name: request.data.name,          // Updated name
          password: request.data.password,  // Ensure password is hashed before saving in production
          branch: request.data.branch,      // Updated branch
          subject: request.data.subject,    // Updated subject
        },
        { new: true } // Return the updated document
      );

      if (!updatedFaculty) {
        return res.status(500).json({ message: 'Failed to update faculty data.' });
      }

      // Update the request status to approved
      request.status = 'approved';
      request.approvedAt = new Date();

    } else if (action === 'reject') {
      // Update the request status to rejected
      request.status = 'rejected';
      request.rejectedAt = new Date();

    } else {
      return res.status(400).json({ message: 'Invalid action. Use "approve" or "reject".' });
    }

    // Save the updated request
    const updatedRequest = await request.save();

    res.status(200).json({
      message: `Request ${action}d successfully.`,
      request: updatedRequest,
    });
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ message: 'Failed to process request.', error: error.message });
  }
};







// 2. Handle Request Approval and Remove Faculty
exports.approveRemovalRequest = async (req, res) => {
  try {
    const { requestId, action } = req.body;  // Receive requestId and action (approve or reject)

    // Find the update request
    const request = await FacultyUpdateRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found.' });
    }

    if (action === 'approve') {
      // Remove the faculty record if approved
      const facultyToDelete = await Faculty.findOneAndDelete({ facultyUsername: request.facultyUsername });
      if (!facultyToDelete) {
        return res.status(404).json({ message: 'Faculty not found to delete.' });
      }

      // Update the request status to approved
      request.status = 'approved';
      request.approvedAt = new Date();
      await request.save();

      res.status(200).json({
        message: 'Faculty removed successfully.',
        request: request,
      });
    } else if (action === 'reject') {
      // Reject the request
      request.status = 'rejected';
      request.rejectedAt = new Date();
      await request.save();

      res.status(200).json({
        message: 'Removal request rejected.',
        request: request,
      });
    } else {
      return res.status(400).json({ message: 'Invalid action. Use "approve" or "reject".' });
    }
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ message: 'Failed to process request.', error: error.message });
  }
};
