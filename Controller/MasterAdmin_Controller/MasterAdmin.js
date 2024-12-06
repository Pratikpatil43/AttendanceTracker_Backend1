// controllers/masterAdminController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const MasterAdmin = require('../../models/MasterAdmin_models/MasterAdminModel');  // Adjust the path as necessary
const Faculty = require('../../models/MasterAdmin_models/FacultyModel');
const loggedInHod = require('../../models/MasterAdmin_models/HodModel')
const Request = require('../../models/Hod_models/RequestModel');
const FacultyUpdateRequest = require('../../models/Hod_models/FacultyUpdateRequest');


// Register MasterAdmin

exports.RegisterMasterAdmin = async (req, res) => {
  try {
    const { name, username, password, role = 'masterAdmin' } = req.body;

    // Check if the username is already taken
    const existingAdmin = await MasterAdmin.findOne({ username });
    if (existingAdmin) {
      return res.status(400).json({ message: 'MasterAdmin already exists with this username' });
    }

    // Check if there is already a root admin (masterAdmin is not set for the first one)
    const firstMasterAdmin = await MasterAdmin.findOne({ masterAdmin: { $exists: false } });

    // If no root admin exists (first MasterAdmin), assign masterAdmin as null
    const masterAdminReference = firstMasterAdmin ? firstMasterAdmin._id : null;

    // Create a new MasterAdmin object
    const newAdmin = new MasterAdmin({
      name,
      username,
      password, // This will be hashed automatically in the pre-save middleware
      role,
      masterAdmin: masterAdminReference // Dynamically assign the first MasterAdmin's _id or null
    });

    // Save to the database
    await newAdmin.save();

    // Send success response
    return res.status(201).json({
      message: 'MasterAdmin registered successfully',
      admin: {
        _id: newAdmin._id, // Mongoose automatically generates this field
        name: newAdmin.name,
        username: newAdmin.username,
        role: newAdmin.role,
        masterAdmin: newAdmin.masterAdmin // This will return the _id of the referenced masterAdmin (or null)
      },
    });
  } catch (error) {
    console.error('Error registering MasterAdmin:', error);
    return res.status(500).json({ message: 'Failed to register MasterAdmin', error: error.message });
  }
};



exports.ForgotPasswordMasterAdmin = async (req, res) => {
  try {
    const { username, newPassword } = req.body;

    // Check if the username exists
    const masterAdmin = await MasterAdmin.findOne({ username });
    if (!masterAdmin) {
      return res.status(404).json({ message: 'MasterAdmin with this username not found.' });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the password directly without triggering the pre-save hook
    await MasterAdmin.updateOne(
      { username }, // Find the user by username
      { $set: { password: hashedPassword } } // Update password with the hashed new password
    );

    // Optionally verify that the password was updated correctly
    const updatedAdmin = await MasterAdmin.findOne({ username });
    console.log('Updated Admin Password:', updatedAdmin.password); // Debugging

    return res.status(200).json({ message: 'Password updated successfully. You can now log in with your new password.' });
  } catch (error) {
    console.error('Error updating password for MasterAdmin:', error.message);
    return res.status(500).json({ message: 'Internal server error.', error: error.message });
  }
};






// Login MasterAdmin

exports.LoginMasterAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find the admin by username
    const admin = await MasterAdmin.findOne({ username }); // Use the username from the request body
    if (!admin) {
      return res.status(404).json({ message: 'MasterAdmin not found' });
    }

    // Compare the hashed password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate a token
    const token = jwt.sign(
      {
        _id: admin._id,        // Admin's _id
        role: admin.role,      // Admin's role
        masterAdmin: admin.masterAdmin || 'root', // Reference to the root master admin
      },
      process.env.JWT_SECRET,
      { expiresIn: '4h' } // Token expiration set to 1 day
    );

    // Return the response with token and admin details
    return res.status(200).json({
      message: 'Login successful',
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        username: admin.username,
        role: admin.role,
        masterAdmin: admin.masterAdmin, // The masterAdmin reference (_id of the root admin or null)
      },
    });
  } catch (error) {
    console.error('Error logging in MasterAdmin:', error);
    return res.status(500).json({ message: 'Failed to log in', error: error.message });
  }
};



// Route to fetch the MasterAdmin's profile
exports.masterAdminprofile = async (req, res) => {
  try {
    // Fetch the MasterAdmin's data using the ID from the token
    const masterAdmin = await MasterAdmin.findById(req.user._id);
    if (!masterAdmin) {
      return res.status(404).json({ message: 'MasterAdmin not found.' });
    }

    return res.status(200).json({
      message: 'Profile fetched successfully.',
      profile: {
        id: masterAdmin._id,
        name: masterAdmin.name,
        username: masterAdmin.username,
        role: masterAdmin.role,
        masterAdmin: MasterAdmin.masterAdmin,
      },
    });
  } catch (error) {
    console.error('Error fetching MasterAdmin profile:', error.message);
    return res.status(500).json({ message: 'Internal server error.', error: error.message });
  }
};




// MasterAdmin approves or rejects a request
exports.approveOrRejectRequest = async (req, res) => {
  const { requestId, action } = req.body; // `action` should be 'approve' or 'reject'

  try {
      // Extract token from Authorization header
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'Authorization token is required' });
      }
  
      // Decode and verify JWT
      let decodedToken;
      try {
        decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      } catch (err) {
        return res.status(403).json({ message: 'Invalid or expired token' });
      }
  
      const { _id: masterAdminId, role } = decodedToken;
  
      // Verify the role is `masterAdmin`
      if (role !== 'masterAdmin') {
        return res.status(403).json({ message: 'Not authorized. You are not the MasterAdmin.' });
      }

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

        // Extract data from the request
        const { name, facultyUsername, password, branch, subject } = request.data; // Access `data`

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
          password, // TODO: Hash the password before saving in production
          branch,
          subject,
          masterAdmin: masterAdminId,
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




exports.getRequests = async (req, res) => {
  try {
    // No need to check for RequestId or masterAdmin since we want all requests
    const requests = await Request.find(); // Fetch all requests without any filter

    // Map through the requests and return _id as RequestId
    const response = requests.map(request => ({
      RequestId: request._id, // Use _id as RequestId
      ...request.toObject(),  // Convert Mongoose document to plain JavaScript object
    }));

    // Send back the requests as a JSON response
    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};



exports.getupdateRequests = async (req, res) => {
  try {
    // No need to check for RequestId or masterAdmin since we want all requests
    const requests = await FacultyUpdateRequest.find(); // Fetch all requests without any filter

    // Map through the requests and return _id as RequestId
    const response = requests.map(request => ({
      RequestId: request._id, // Use _id as RequestId
      ...request.toObject(),  // Convert Mongoose document to plain JavaScript object
    }));

    // Send back the requests as a JSON response
    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
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

    console.log('Request Details:', request);  // Debugging log

    if (action === 'approve') {
      // Find the faculty to update by facultyUsername
      const faculty = await Faculty.findOne({ facultyUsername: request.facultyUsername });
      if (!faculty) {
        return res.status(404).json({ message: 'Faculty not found.' });
      }


      // Hash password if provided
      if (request.data.password) {
        const hashedPassword = await bcrypt.hash(request.data.password, 10);
        request.data.password = hashedPassword;
      }

      // Update the faculty document with the new data from the request
      const updatedFaculty = await Faculty.findOneAndUpdate(
        { facultyUsername: request.facultyUsername }, // Find faculty by facultyUsername
        {
          name: request.data.name,          // Updated name
          password: request.data.password,  // Updated password (hashed)
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
    if (!updatedRequest) {
      return res.status(500).json({ message: 'Failed to save the request update.' });
    }

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


