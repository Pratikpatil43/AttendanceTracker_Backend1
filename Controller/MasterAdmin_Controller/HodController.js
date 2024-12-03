const bcrypt = require('bcrypt'); // Import bcrypt for hashing passwords
const HOD = require('./../../models/MasterAdmin_models/HodModel');
const MasterAdmin = require('../../models/MasterAdmin_models/MasterAdminModel');
const jwt = require('jsonwebtoken');


exports.addHOD = async (req, res) => {
  try {
    const { name, role, username, password, branch } = req.body;

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

    // Check for existing HOD username
    const existingHOD = await HOD.findOne({ username });
    if (existingHOD) {
      return res.status(400).json({ message: 'HOD with this username already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save new HOD
    const newHOD = new HOD({
      name,
      username,
      password: hashedPassword,
      branch,
      role: role || 'hod', // Default role as 'HOD' if not provided
      masterAdmin: masterAdminId, // Link with MasterAdmin via _id
    });

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

    // Find all HODs associated with this `MasterAdmin`'s `_id`
    const hods = await HOD.find({ masterAdmin: masterAdminId });

    // Check if HODs exist
    if (!hods || hods.length === 0) {
      return res.status(404).json({ message: 'No HODs found for this MasterAdmin.' });
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
    const hodId = req.params.id;

    // Find the HOD and verify ownership by MasterAdmin
    const hod = await HOD.findOne({ _id: hodId, masterAdmin: masterAdminId });
    if (!hod) {
      return res.status(404).json({ message: 'HOD not found or not associated with the MasterAdmin.' });
    }

    // Delete the HOD
    await HOD.findByIdAndDelete(hodId);

    res.status(200).json({ message: 'HOD removed successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove HOD.', error: error.message });
  }
};




// Function to update an HOD by ID
exports.updateHOD = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check if password is provided and hash it
    if (updates.password) {
      const salt = await bcrypt.genSalt(10); // Generate salt
      updates.password = await bcrypt.hash(updates.password, salt); // Hash password
    }

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





