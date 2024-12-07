const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const cors = require('cors');
require('dotenv').config(); // Load environment variables

// Import route files
const masterAdminhodRoutes = require('./routes/MasterAdmin_routes/hodRoutes');
const hodRoutes = require('./routes/Hod_routes/HodRoutes');
const masterAdminFacultyRoutes = require('./routes/MasterAdmin_routes/FacultyRoutes');
const FacultyRoutes = require('./routes/Faculty_routes/faculty_route');
const attendanceRoute = require('./routes/Faculty_routes/attendance_route');
const masterAdminRoutes = require('./routes/MasterAdmin_routes/MasterAdminRoutes');
const studentRoute = require('./routes/Student_routes/student_route');
const connectDB = require('./config/db');

// Initialize app
const app = express();

// Middleware to parse JSON
app.use(express.json());

// Allow requests from specific origins
const allowedOrigins = [
  'https://hodadmin.vercel.app',
  'https://masteradmin.vercel.app',
];

// Configure CORS
app.use(
  cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
    credentials: true, // Allow cookies and credentials
  })
);

// Configure session
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'defaultSecret', // Secret key for signing the session ID cookie
    resave: false, // Don't save session if not modified
    saveUninitialized: true, // Store session even if not initialized
    cookie: { 
      secure: process.env.NODE_ENV === 'production', // Set to true if using HTTPS in production
      maxAge: 2 * 60 * 60 * 1000, // Session cookie expiry: 2 hours
      sameSite: 'lax', // Ensure compatibility with CORS
    },
  })
);

// Connect to MongoDB
connectDB();

// Routes for Master Admin
app.use('/api/masterAdmin/hod', masterAdminhodRoutes);
app.use('/api/masterAdmin/faculty', masterAdminFacultyRoutes);
app.use('/api/masterAdmin', masterAdminRoutes);

// Routes for HOD
app.use('/api/hod', hodRoutes);

// Routes for Faculty
app.use('/api/faculty', FacultyRoutes);

// Faculty Attendance Routes
app.use('/api/faculty/attendance', attendanceRoute);

// Student Routes
app.use('/api/student', studentRoute);

// Debugging Middleware (Optional)
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url} from ${req.headers.origin}`);
  next();
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(`Error: ${err.message}`);
  res.status(err.status || 500).json({ error: err.message });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
