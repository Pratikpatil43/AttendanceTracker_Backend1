// controllers/facultyController.js
const Faculty = require('../MasterAdmin_models/FacultyModel');

// Add Faculty
exports.addFaculty = async (req, res) => {
  try {
    const { name, username, password, branch, subject } = req.body;

    // Create a new Faculty document
    const newFaculty = new Faculty({
      name,
      username,
      password, // The password will be hashed automatically in the pre-save hook
      branch,
      subject,
    });

    // Save the new Faculty to the database
    await newFaculty.save();

    res.status(201).json({ message: 'Faculty added successfully', faculty: newFaculty });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add Faculty', error: error.message });
  }
};



// Get Faculty by username
exports.getFaculty = async (req, res) => {
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
exports.updateFaculty = async (req, res) => {
    try {
      const { id } = req.params;
      const { name, username, password, branch, subject } = req.body;
  
      const faculty = await Faculty.findById(id);
  
      if (!faculty) {
        return res.status(404).json({ message: 'Faculty not found' });
      }
  
      // Update Faculty fields
      faculty.name = name || faculty.name;
      faculty.username = username || faculty.username;
      faculty.password = password || faculty.password;
      faculty.branch = branch || faculty.branch;
      faculty.subject = subject || faculty.subject;
  
      // Save the updated faculty document
      await faculty.save();
  
      res.status(200).json({ message: 'Faculty updated successfully', faculty });
    } catch (error) {
      res.status(500).json({ message: 'Failed to update Faculty', error: error.message });
    }
  };

  
// Remove Faculty
exports.removeFaculty = async (req, res) => {
    try {
      const { id } = req.params;
  
      const faculty = await Faculty.findById(id);
  
      if (!faculty) {
        return res.status(404).json({ message: 'Faculty not found' });
      }
  
      // Remove Faculty from the database
      await Faculty.findByIdAndDelete(id);
  
      res.status(200).json({ message: 'Faculty removed successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to remove Faculty', error: error.message });
    }
  };
  