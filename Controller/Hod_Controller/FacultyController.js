const Request = require('../../models/Hod_models/RequestModel');
const HOD = require('../../models/MasterAdmin_models/HodModel');
const AddedFaculty = require('../../models/MasterAdmin_models/FacultyModel');
const FacultyUpdateRequest = require('../../models/Hod_models/FacultyUpdateRequest');
const Faculty = require('../../models/MasterAdmin_models/FacultyModel');
const MasterAdmin = require('../../models/MasterAdmin_models/MasterAdminModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // Add bcrypt library

// Route to create request for adding faculty
exports.addFacultyHod = async (req, res) => {
  try {
    const { name, facultyUsername, password, branch, subject, type, action } = req.body;
    
    // Extract token from Authorization header
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authorization token is required' });
    }

    // Decode and verify JWT
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const masterAdminId = decodedToken._id;

    if (!masterAdminId) {
      return res.status(400).json({ message: 'MasterAdmin ID not found in token' });
    }

    // Find MasterAdmin using _id
    const masterAdmin = await HOD.findById(masterAdminId);
    if (!masterAdmin) {
      return res.status(404).json({ message: 'MasterAdmin not found' });
    }

    // Ensure required fields are present
    if (!name || !facultyUsername || !password || !branch || !subject || !type || !action) {
      return res.status(400).json({ message: 'Missing required fields in the request body' });
    }

    // Fetch HOD details from the database using the logged-in HOD's username
    const hod = await HOD.findOne({ username: req.user.username });
    if (!hod) {
      return res.status(404).json({ message: 'HOD not found' });
    }

    const existingusername = await Faculty.findOne({ facultyUsername });
    if (existingusername) {
      return res.status(404).json({ message: 'Faculty Username already exists' });
    }

    // Hash the faculty password
    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password with salt rounds

    // Create a new request object for adding a faculty
    const newRequest = new Request({
      hodUsername: req.user.username, // Logged-in HOD's username
      facultyUsername, // Faculty username
      password: hashedPassword, // Save the hashed password
      branch, // Faculty branch
      subject, // Faculty subject
      type, // Type of request (create/update)
      action, // Action (create or update)
      data: {
        name, // Name of the faculty
        facultyUsername, // Faculty username
        password: hashedPassword, // Password
        branch, // Branch
        subject // Subject
      },
      masterAdmin: hod.masterAdmin // MasterAdmin ID from the HOD record
    });

    // Save the new faculty request to the database
    await newRequest.save();

    // Return success response
    res.status(201).json({
      message: 'Request to add faculty created successfully. Waiting for approval.',
      request: newRequest,
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Failed to create request for adding faculty', error: error.message });
  }
};

// HOD creates a request to update faculty
exports.updateFacultyHod = async (req, res) => {
  try {
    const { id } = req.params; // Faculty ID
    const { name, facultyUsername, password, branch, subject, action } = req.body;

    // Find the faculty by ID in the Faculty schema (before creating a request)
    const faculty = await Faculty.findById(id);  // Fetch faculty from Faculty schema
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found.' });
    }

    // Get the logged-in HOD
    const hod = await HOD.findOne({ username: req.user.username });
    if (!hod) {
      return res.status(404).json({ message: 'HOD not found.' });
    }

    // Hash the new password if provided
    let hashedPassword = faculty.password; // Default to existing password if no new one provided
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10); // Hash new password
    }

    // Create an update request with the data fetched from Faculty schema and the new data provided
    const updateRequest = new FacultyUpdateRequest({
      hodUsername: req.user.username,
      facultyUsername,
      requestId: id,
      data: {
        name: name || faculty.name, // If name is not provided, use existing faculty's name
        facultyUsername: facultyUsername || faculty.facultyUsername,
        password: hashedPassword, // Store the hashed password
        branch: branch || faculty.branch,
        subject: subject || faculty.subject,
      },
      action: action || 'update',
      masterAdmin: hod.masterAdmin,
    });

    // Save the request
    await updateRequest.save();

    res.status(201).json({
      message: 'Update request created successfully. Waiting for MasterAdmin approval.',
      request: updateRequest,
    });
  } catch (error) {
    console.error('Error creating update request:', error);
    res.status(500).json({ message: 'Failed to create update request.', error: error.message });
  }
};



// Get Faculty by username
exports.getFacultyHod = async (req, res) => {
  try {
    // Fetch all faculty members from the database
    const facultyMembers = await Faculty.find();

    // If no faculty members are found
    if (!facultyMembers || facultyMembers.length === 0) {
      return res.status(404).json({ message: 'No faculty members found' });
    }

    // Return all faculty members with their MongoDB unique _id and relevant info
    res.status(200).json({
      facultyMembers: facultyMembers.map(faculty => ({
        id: faculty._id,  // MongoDB unique ID
        name: faculty.name, // Correct access to `name`
        username: faculty.facultyUsername, // Adjust if the field is named differently
        branch: faculty.branch,
        subject: faculty.subject,
      }))
    });
  } catch (error) {
    console.error('Error fetching faculty members:', error);
    res.status(500).json({ message: 'Failed to retrieve faculty members', error: error.message });
  }
};






exports.removeFacultyHod = async (req, res) => {
  try {
    const { id } = req.params; // Getting the faculty's MongoDB ObjectId from URL params

    // Ensure the ID is provided
    if (!id) {
      return res.status(400).json({ message: 'Faculty ID is required.' });
    }

    // Check if the faculty exists by ID
    const faculty = await Faculty.findById(id); // Querying by faculty _id
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found.' });
    }

    // Ensure HOD details are available
    const hod = await HOD.findOne({ username: req.user.username });
    if (!hod) {
      return res.status(404).json({ message: 'HOD not found.' });
    }

    // Remove any existing request for this faculty
    await FacultyUpdateRequest.deleteOne({ facultyUsername: faculty.facultyUsername });

    // Create a new removal request for the faculty
    const newRequest = new FacultyUpdateRequest({
      facultyUsername: faculty.facultyUsername, // Add the faculty's username to the request
      hodUsername: req.user.username, // HOD's username
      password: faculty.password, // Existing faculty password
      branch: faculty.branch, // Existing faculty branch
      subject: faculty.subject, // Existing faculty subject
      type: 'remove', // Removal type
      action: 'remove', // Action to be taken
      data: {
        name: faculty.name, // Name of the faculty
        password: faculty.password, // Password (can be kept for reference)
        branch: faculty.branch, // Branch
        subject: faculty.subject, // Subject
      },
      masterAdmin: hod.masterAdmin, // Assuming MasterAdmin ID is stored in req.user
    });

    // Save the removal request
    await newRequest.save();

    res.status(201).json({
      message: 'Removal request created successfully. Waiting for approval.',
      request: newRequest,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: 'Failed to create removal request for faculty.', error: error.message });
  }
};
