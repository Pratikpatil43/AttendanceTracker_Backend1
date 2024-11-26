const bcrypt = require('bcrypt'); // Import bcrypt for hashing passwords
const HOD = require('./../../models/MasterAdmin_models/HodModel');
const MasterAdmin = require('../../models/MasterAdmin_models/MasterAdminModel');


// Function to add a new HOD
exports.addHOD = async (req, res) => {
  try {
    const { name, username, password, branch } = req.body;

    // Find the MasterAdmin by some condition (e.g., username or _id)
    const masterAdmin = await MasterAdmin.findOne(); // Adjust this query to find a specific MasterAdmin if needed
    if (!masterAdmin) {
      return res.status(404).json({ message: 'Master Admin not found' });
    }

    // Check if the username already exists for an HOD
    const existingHOD = await HOD.findOne({ username });
    if (existingHOD) {
      return res.status(400).json({ message: 'HOD with this username already exists' });
    }

    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the saltRounds, can be adjusted for more security

    // Create the new HOD and associate with the MasterAdmin by ObjectId
    const newHOD = new HOD({
      name,
      username,
      password: hashedPassword, // Store the hashed password
      branch,
      masterAdmin: masterAdmin._id // Associate the MasterAdmin via _id
    });

    // Save the new HOD to the database
    await newHOD.save();

    res.status(201).json({ message: 'HOD added successfully', hod: newHOD });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add HOD', error: error.message });
  }
};



// Function to get all HODs for a specific MasterAdmin
exports.getHODs = async (req, res) => {
  try {
    const masterAdminId = req.params.masterAdminId; // Correctly extract masterAdminId from params

    // Find the MasterAdmin by ID
    const masterAdmin = await MasterAdmin.findById(masterAdminId); // Use masterAdminId here
    if (!masterAdmin) {
      return res.status(404).json({ message: 'Master Admin not found' });
    }

    // Get all HODs associated with this MasterAdmin
    const hods = await HOD.find({ masterAdmin: masterAdminId });

    res.status(200).json({ hods });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve HODs', error: error.message });
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






