const express = require('express');
const mongoose = require('mongoose');
const masterAdminhodRoutes = require('./routes/MasterAdmin_routes/hodRoutes');
const hodRoutes = require('./routes/Hod_routes/HodRoutes');
const masterAdminFacultyRoutes = require('./routes/MasterAdmin_routes/FacultyRoutes');
const FacultyRoutes = require('./routes/Faculty_routes/faculty_route')
const attendanceRoute = require('./routes/Faculty_routes/attendance_route');  // Make sure path is correct
const masterAdminRoutes = require('./routes/MasterAdmin_routes/MasterAdminRoutes');
const studentRoute = require('./routes/Student_routes/student_route')
const HodAdminprofile = require('./routes/Hod_routes/HodRoutes')
const connectDB = require('./config/db');
const session = require('express-session'); // Import the session middleware
const cors = require('cors');


const app = express();

// Middleware
app.use(express.json());

app.use(cors({
  origin: ['http://localhost:5173','http://localhost:5174',' http://localhost:5175','http://localhost:5176'], // add the URLs of your frontends
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

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
app.use('/api/masterAdmin/faculty', masterAdminFacultyRoutes);
app.use('/api/masterAdmin', masterAdminRoutes);

// Routes for HOD
app.use('/api/hod', hodRoutes);


                                                                                                               
// Routes for Faculty
app.use('/api/faculty', FacultyRoutes);

// Faculty Attendance
app.use('/api/faculty/attendance', attendanceRoute);  // Ensure this path is correct

//Student Routes
app.use('/api/student', studentRoute);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
