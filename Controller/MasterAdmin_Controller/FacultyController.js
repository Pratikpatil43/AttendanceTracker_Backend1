// Create Faculty (Add)
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const MasterAdmin = require('../../models/MasterAdmin_models/MasterAdminModel');
const Faculty = require('../../models/MasterAdmin_models/FacultyModel');


exports.addFaculty = async (req, res) => {
  try {
    const { name, facultyUsername, password, branch, subject } = req.body;

    // Ensure required fields are present
    if (!name || !facultyUsername || !password || !branch || !subject) {
      return res.status(400).json({ message: 'Missing required fields in the request body' });
    }

    // Get the token from the Authorization header
    const token = req.headers.authorization?.split(' ')[1];  // Bearer <token>

    if (!token) {
      return res.status(401).json({ message: 'Authorization token is required' });
    }

    // Verify the token and extract masterAdminId from it
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);  // Use your JWT secret

    // The masterAdminId will be decoded from the token
    const masterAdminId = decodedToken.masterAdminId;  // Extract masterAdminId from the decoded token

    if (!masterAdminId) {
      return res.status(400).json({ message: 'MasterAdmin ID not found in token' });
    }

    // Find the MasterAdmin by ID (MasterAdmin ID should be part of the decoded token)
    const masterAdmin = await MasterAdmin.findById(masterAdminId);
    if (!masterAdmin) {
      return res.status(404).json({ message: 'Master Admin not found' });
    }

    // Check if the faculty already exists (make sure to await the result)
    const existingFaculty = await Faculty.findOne({ facultyUsername: facultyUsername });
    if (existingFaculty) {
      return res.status(400).json({ message: 'Faculty already exists' });
    }

    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the saltRounds

    // Create a new faculty object and associate it with the MasterAdmin via masterAdminId
    const newFaculty = new Faculty({
      name,
      facultyUsername,
      password: hashedPassword,  // Store the hashed password
      branch,
      subject,
      masterAdminId: masterAdminId,  // Associate the MasterAdmin via ObjectId
    });

    // Save the new faculty to the database
    await newFaculty.save();

    // Send success response
    return res.status(201).json({
      message: 'Faculty added successfully.',
      faculty: newFaculty,
    });
  } catch (error) {
    console.error('Error adding faculty:', error);
    return res.status(500).json({ message: 'Failed to add faculty', error: error.message });
  }
};




// Get All Faculty
exports.getFaculty = async (req, res) => {
  try {
    // Fetch all faculty members from the database
    const facultyMembers = await Faculty.findById({masterAdminId});

    if (!facultyMembers || facultyMembers.length === 0) {
      return res.status(404).json({ message: 'No faculty members found' });
    }

    res.status(200).json({
      facultyMembers: facultyMembers.map(faculty => ({
        id: faculty._id,
        name: faculty.name,
        username: faculty.facultyUsername,
        branch: faculty.branch,
        subject: faculty.subject,
      }))
    });
  } catch (error) {
    console.error('Error fetching faculty members:', error);
    res.status(500).json({ message: 'Failed to retrieve faculty members', error: error.message });
  }
};

// Update Faculty (Update)
exports.updateFaculty = async (req, res) => {
  try {
    const { id } = req.params; // Faculty ID
    const { name, facultyUsername, password, branch, subject } = req.body;

    // Find the faculty by ID and update the fields
    const updatedFaculty = await Faculty.findByIdAndUpdate(
      id,
      { name, facultyUsername, password, branch, subject },
      { new: true } // Return the updated document
    );

    if (!updatedFaculty) {
      return res.status(404).json({ message: 'Faculty not found.' });
    }

    res.status(200).json({
      message: 'Faculty updated successfully.',
      faculty: updatedFaculty,
    });
  } catch (error) {
    console.error('Error updating faculty:', error);
    res.status(500).json({ message: 'Failed to update faculty', error: error.message });
  }
};

// Delete Faculty (Remove)
exports.removeFaculty = async (req, res) => {
  try {
    const { id } = req.params; // Faculty ID

    // Find the faculty by ID and delete
    const deletedFaculty = await Faculty.findByIdAndDelete(id);

    if (!deletedFaculty) {
      return res.status(404).json({ message: 'Faculty not found.' });
    }

    res.status(200).json({
      message: 'Faculty removed successfully.',
      faculty: deletedFaculty,
    });
  } catch (error) {
    console.error('Error removing faculty:', error);
    res.status(500).json({ message: 'Failed to remove faculty', error: error.message });
  }
};
