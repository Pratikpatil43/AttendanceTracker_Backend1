const Request = require('../../models/Hod_models/RequestModel');
const HOD = require('../../models/MasterAdmin_models/HodModel');
const AddedFaculty = require('../../models/MasterAdmin_models/FacultyModel');
const FacultyUpdateRequest = require('../../models/Hod_models/FacultyUpdateRequest');
const Faculty = require('../../models/MasterAdmin_models/FacultyModel');




// Route to create request for adding faculty
exports.addFacultyHod = async (req, res) => {
  try {
    const { name, facultyUsername, password, branch, subject, type, action } = req.body;

    // Ensure required fields are present
    if (!name || !facultyUsername || !password || !branch || !subject || !type || !action) {
      return res.status(400).json({ message: 'Missing required fields in the request body' });
    }

    // Fetch HOD details from the database using the logged-in HOD's username
    const hod = await HOD.findOne({ username: req.user.username });

    if (!hod) {
      return res.status(404).json({ message: 'HOD not found' });
    }

    // Create a new request object for adding a faculty
    const newRequest = new Request({
      hodUsername: req.user.username, // Logged-in HOD's username
      facultyUsername, // Faculty username
      password, // Faculty password
      branch, // Faculty branch
      subject, // Faculty subject
      type, // Type of request (create/update)
      action, // Action (create or update)
      data: {
        name, // Name of the faculty
        facultyUsername, // Faculty username
        password, // Password
        branch, // Branch
        subject // Subject
      },
      masterAdminId: hod.masterAdmin // MasterAdmin ID from the HOD record
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



// Get Faculty by username
exports.getFacultyHod = async (req, res) => {
  try {
    // Fetch all faculty members from the database
    const facultyMembers = await Faculty.find();

    // If no faculty members are found
    if (facultyMembers.length === 0) {
      return res.status(404).json({ message: 'No faculty members found' });
    }

    // Return all faculty members with their MongoDB unique _id and relevant info
    res.status(200).json({
      facultyMembers: facultyMembers.map(faculty => ({
        id: faculty._id,  // MongoDB unique ID
        name: faculty.name,
        username: faculty.username,
        branch: faculty.branch,
        subject: faculty.subject,
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve faculty members', error: error.message });
  }
};



// Update Faculty
// Update Faculty (Send Request for Approval)
// Update Faculty Request
// Update Faculty Request
exports.updateFacultyHod = async (req, res) => {
  try {
    const { id } = req.params; // Faculty ID to update
    const { name, password, branch, subject,action } = req.body;

    // Find the existing faculty by ID
    const faculty = await AddedFaculty.findById(id);
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    const hod = await HOD.findOne({ username: req.user.username });


    // Create the update request for the faculty
    const newRequest = new FacultyUpdateRequest({
      hodUsername: req.user.username, // HOD's username (from the logged-in HOD)
      password: password || faculty.password, // New password (if provided)
      branch: branch || faculty.branch, // New branch (if provided)
      action: action || faculty.action,
      subject: subject || faculty.subject, // New subject (if provided)
      data: {
        name: name || faculty.name, // New name (if provided)
        password: password || faculty.password, // Password (if provided)
        branch: branch || faculty.branch, // Branch (if provided)
        action: action || faculty.action,
        subject: subject || faculty.subject, // Subject (if provided)
      },
      masterAdminId: hod.masterAdmin, // Master Admin ID (from the logged-in user)
    });

    // Save the request to the database
    await newRequest.save();

    // Return success response
    res.status(201).json({
      message: 'Update request created successfully. Waiting for approval.',
      request: newRequest,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to create update request for faculty',
      error: error.message,
    });
  }
};





// Remove Faculty (After request approval)
// Remove Faculty (Send Request for Approval)
// Remove Faculty Request
exports.removeFacultyHod = async (req, res) => {
  try {
    const { id } = req.params; // Faculty ID to remove

    // Check if the faculty exists
    const faculty = await AddedFaculty.findById(id);
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    const hod = await HOD.findOne({ username: req.user.username });


    // Create the removal request for the faculty
    const newRequest = new Faculty({
      hodUsername: req.user.username,  // HOD's username
      password: faculty.password,  // Existing faculty password
      branch: faculty.branch,  // Existing faculty branch
      subject: faculty.subject,  // Existing faculty subject
      type: 'remove',  // Remove type
      action: 'remove',  // Action to be taken
      data: {
        name: faculty.name,  // Name of the faculty
        password: faculty.password,  // Password (can be kept for reference)
        branch: faculty.branch,  // Branch
        subject: faculty.subject,  // Subject
      },
      masterAdminId: hod.masterAdmin,  // Assuming MasterAdmin ID is stored in req.user
    });

    await newRequest.save();

    res.status(201).json({
      message: 'Removal request created successfully. Waiting for approval.',
      request: newRequest,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create removal request for faculty', error: error.message });
  }
};
