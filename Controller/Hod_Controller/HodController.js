const Request = require('../../models/MasterAdmin_models/RequestModel');
const Faculty = require('../../models/MasterAdmin_models/FacultyModel');
const jwt = require('jsonwebtoken');
const HOD = require('../../models/MasterAdmin_models/HodModel');



const createRequest = async (req, res) => {
  const { username, action } = req.body; // Faculty's username and action type
  try {
    // Validate HOD's identity
    const hod = await HOD.findOne({ username: req.user.username });
    if (!hod) return res.status(404).json({ message: 'HOD not found.' });

    // Check for faculty existence if not adding
    let faculty;
    if (action !== 'add') {
      faculty = await Faculty.findOne({ Facultyusername: username });  // Use Facultyusername to find the faculty
      if (!faculty) return res.status(404).json({ message: 'Faculty not found.' });
    }

    // Create a new request
    const newRequest = new Request({
      hodUsername: req.user.username,  // Set HOD's username from the authenticated user
      facultyUsername: username,      // Set faculty's username from the request body
      action,
      status: 'pending',
      masterAdminId: hod.masterAdmin, // Assuming HOD has a masterAdmin field
    });

    // Save the request
    await newRequest.save();
    res.status(201).json({ message: 'Request sent to MasterAdmin.', request: newRequest });
  } catch (error) {
    res.status(500).json({ message: 'Error creating request.', error });
  }
};


// Get all requests made by the HOD
const getAllRequests = async (req, res) => {
  try {
    const requests = await Request.find({ hodUsername: req.user.username });
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching requests.', error });
  }
};



const HodAdminprofile = async (req, res) => {
  try {
    // Fetch the MasterAdmin's data using the ID from the token
    const masterAdmin = await HOD.findById(req.user._id);
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
        masterAdmin: masterAdmin.masterAdmin,
      },
    });
  } catch (error) {
    console.error('Error fetching MasterAdmin profile:', error.message);
    return res.status(500).json({ message: 'Internal server error.', error: error.message });
  }
};







module.exports = {getAllRequests,createRequest,HodAdminprofile}










