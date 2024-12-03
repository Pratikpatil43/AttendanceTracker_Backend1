// Create Faculty (Add)
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const MasterAdmin = require('../../models/MasterAdmin_models/MasterAdminModel');
const Faculty = require('../../models/MasterAdmin_models/FacultyModel');
const mongoose = require('mongoose');


exports.addFaculty = async (req, res) => {
  try {
    const { name, facultyUsername, password, branch, subject } = req.body;


    // Ensure required fields are present
    if (!name || !facultyUsername || !password || !branch || !subject) {
      return res.status(400).json({ message: 'Missing required fields in the request body' });
    }

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
   const masterAdmin = await MasterAdmin.findById(masterAdminId);
   if (!masterAdmin) {
     return res.status(404).json({ message: 'MasterAdmin not found' });
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
      masterAdmin: masterAdminId,  // Associate the MasterAdmin via ObjectId
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
 
     const { _id: masterAdmin, role } = decodedToken;
 
     // Verify the role is `masterAdmin`
     if (role !== 'masterAdmin') {
       return res.status(403).json({ message: 'Not authorized. You are not the MasterAdmin.' });
     }
    // Fetch all faculty members from the database
    const facultyMembers = await Faculty.find({ masterAdmin: masterAdmin });

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
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid Faculty ID format" });
  }

  try {
    const updatedFaculty = await Faculty.findByIdAndUpdate(id, req.body, { new: true });

    if (!updatedFaculty) {
      return res.status(404).json({ message: "Faculty not found" });
    }

    res.status(200).json(updatedFaculty);
  } catch (err) {
    res.status(500).json({ message: "Error updating faculty", error: err.message });
  }
};



// Delete Faculty (Remove)
exports.removeFaculty = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authorization token is required.' });
    }

    // Verify the JWT
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(403).json({ message: 'Invalid or expired token.' });
    }

    const { _id: masterAdminId, role } = decodedToken;

    // Ensure the user has the correct role
    if (role !== 'masterAdmin') {
      return res.status(403).json({ message: 'Not authorized. Only MasterAdmin can perform this action.' });
    }

    // Get the HOD's ID from the request URL
    const facultyId = req.params.id;

    // Find the HOD and verify ownership by MasterAdmin
    const faculty = await Faculty.findOne({ _id: facultyId, masterAdmin: masterAdminId });
    if (!faculty) {
      return res.status(404).json({ message: 'HOD not found or not associated with the MasterAdmin.' });
    }

    // Delete the HOD
    await Faculty.findByIdAndDelete(facultyId);

    res.status(200).json({ message: 'Faculty removed successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove HOD.', error: error.message });
  }
};
