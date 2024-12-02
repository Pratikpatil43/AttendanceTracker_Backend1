const bcrypt = require('bcrypt'); // Import bcrypt for hashing passwords
const HOD = require('./../../models/MasterAdmin_models/HodModel');
const MasterAdmin = require('../../models/MasterAdmin_models/MasterAdminModel');
const jwt = require('jsonwebtoken');


// Function to add a new HOD
exports.addHOD = async (req, res) => {
  try {
    const { name, role, username, password, branch,masterAdminId } = req.body; 

    // Get the token from the Authorization header
    const token = req.headers.authorization?.split(' ')[1];  // Bearer <token>

    if (!token) {
      return res.status(401).json({ message: 'Authorization token is required' });
    }

    // Verify the token and extract masterAdminId from it
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);  // Use your JWT secret

    if (!masterAdminId) {
      return res.status(400).json({ message: 'MasterAdmin ID not found in token' });
    }

    // Find the MasterAdmin by ID (MasterAdmin ID should be part of the decoded token)
    const masterAdmin = await MasterAdmin.find({masterAdminId});
    if (!masterAdmin) {
      return res.status(404).json({ message: 'Master Admin not found' });
    }

    // Check if the username already exists for an HOD
    const existingHOD = await HOD.findOne({ username });
    if (existingHOD) {
      return res.status(400).json({ message: 'HOD with this username already exists' });
    }

    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the saltRounds

    // Create the new HOD and associate it with the MasterAdmin via masterAdminId
    const newHOD = new HOD({
      name,
      username,
      password: hashedPassword, // Store the hashed password
      branch,
      role,
      masterAdminId: masterAdminId, // Associate the MasterAdmin via _id
    });

    // Save the new HOD to the database
    await newHOD.save();

    res.status(201).json({ message: 'HOD added successfully', hod: newHOD });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to add HOD', error: error.message });
  }
};




// Function to get all HODs for a specific MasterAdmin
exports.getHODs = async (req, res) => {
  try {
    const masterAdminId = req.params.masterAdminId;

    // Validate MasterAdmin ID
    if (!masterAdminId) {
      return res.status(400).json({ message: 'Master Admin ID is required' });
    }

    // Find the MasterAdmin by ID
    // const masterAdmin = await MasterAdmin.findById(masterAdminId);
    // if (!masterAdmin) {
    //   return res.status(404).json({ message: 'Master Admin not found' });
    // }

    // Get all HODs associated with this MasterAdmin
    const hods = await HOD.find( {masterAdminId} );

    // Check if no HODs are found
    if (hods.length === 0) {
      return res.status(404).json({ message: 'No HODs have been added yet' });
    }

    // Return the list of HODs
    return res.status(200).json({ hods });
  } catch (error) {
    console.error('Error retrieving HODs:', error);
    return res.status(500).json({ message: 'Failed to retrieve HODs', error: error.message });
  }
};



exports.getMasterAdminDetails = async (req, res) => {
  try {
    const { userId } = req.user; // Assuming user info is extracted from token
    const masterAdmin = await MasterAdmin.findOne({ userId });

    if (!masterAdmin) {
      return res.status(404).json({ message: "Master Admin not found." });
    }

    return res.status(200).json({ masterAdminId: masterAdmin._id });
  } catch (error) {
    console.error("Error fetching Master Admin details:", error);
    return res.status(500).json({ message: "Failed to fetch details." });
  }
};




// Function to remove an HOD by ID
exports.removeHOD = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete the HOD by ID
    const hod = await HOD.findByIdAndDelete(id);
    if (!hod) {
      return res.status(404).json({ message: 'HOD not found' });
    }

    res.status(200).json({ message: 'HOD removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove HOD', error: error.message });
  }
};


// Function to update an HOD by ID
exports.updateHOD = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Find the HOD by ID and apply updates
    const updatedHOD = await HOD.findByIdAndUpdate(id, updates, { new: true });
    if (!updatedHOD) {
      return res.status(404).json({ message: 'HOD not found' });
    }

    res.status(200).json({ message: 'HOD updated successfully', hod: updatedHOD });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update HOD', error: error.message });
  }
};






