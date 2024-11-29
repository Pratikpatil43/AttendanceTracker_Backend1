const Faculty = require('../../models/MasterAdmin_models/FacultyModel');

// Create Faculty (Add)
exports.addFaculty = async (req, res) => {
  try {
    const { name, facultyUsername, password, branch, subject } = req.body;

    // Ensure required fields are present
    if (!name || !facultyUsername || !password || !branch || !subject) {
      return res.status(400).json({ message: 'Missing required fields in the request body' });
    }

    // Check if the faculty already exists (make sure to await the result)
    const existingFaculty = await Faculty.findOne({ facultyUsername: facultyUsername });

    if (existingFaculty) {
      // If faculty exists, send a response and stop further execution
      return res.status(400).json({ message: 'Faculty already exists' });
    }

    // Create a new faculty object
    const newFaculty = new Faculty({
      name,
      facultyUsername,
      password,
      branch,
      subject,
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
    // Ensure error response is only sent once
    return res.status(500).json({ message: 'Failed to add faculty', error: error.message });
  }
};




// Get All Faculty
exports.getFaculty = async (req, res) => {
  try {
    // Fetch all faculty members from the database
    const facultyMembers = await Faculty.find();

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
