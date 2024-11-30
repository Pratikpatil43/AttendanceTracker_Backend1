const express = require('express');
const mongoose = require('mongoose');
const masterAdminhodRoutes = require('./routes/MasterAdmin_routes/hodRoutes');
const hodRoutes = require('./routes/Hod_routes/HodRoutes');
const FacultyRoutes = require('./routes/MasterAdmin_routes/FacultyRoutes');
const masterAdminRoutes = require('./routes/MasterAdmin_routes/MasterAdminRoutes');
const facultyroutes = require('./routes/Faculty_routes/faculty_route');
const connectDB = require('./config/db');
const session = require('express-session'); // Import the session middleware


const app = express();

// Middleware
app.use(express.json());

app.use(session({
  secret: 'hushfsdhfj65634hoiuhftwebhber454&^^#$*',  // Secret key for signing the session ID cookie
  resave: false,  // Don't save session if it's not modified
  saveUninitialized: true,  // Store a session even if it's not initialized
  cookie: { 
    secure: false,  // Set to true if using HTTPS
    maxAge: 2 * 60 * 60 * 1000  // 2 hours in milliseconds
  }
}));


// Database Connection
connectDB();

// Routes for Master Admin
app.use('/api/masterAdmin/hod', masterAdminhodRoutes);
app.use('/api/masterAdmin/faculty', FacultyRoutes);
app.use('/api/masterAdmin', masterAdminRoutes);

// Routes for HOD
app.use('/api/hod', hodRoutes);

// Routes for Faculty
app.use('/api/faculty', facultyroutes);



// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
