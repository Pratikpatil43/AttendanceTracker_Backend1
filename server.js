const express = require('express');
const mongoose = require('mongoose');
const hodRoutes = require('./routes/MasterAdmin_routes/hodRoutes');
const HodLogin = require('./routes/Hod_routes/HodRoutes')
const FacultyRoutes = require('./routes/MasterAdmin_routes/FacultyRoutes');
const masterAdminRoutes = require('./routes/MasterAdmin_routes/MasterAdminRoutes')
const connectDB = require('./config/db')

const app = express();

// Middleware
app.use(express.json());

// Database Connection
connectDB();

// Routes for Master Admin
app.use('/api/hod', hodRoutes);
app.use('/api/faculty', FacultyRoutes);
app.use('/api/masterAdmin', masterAdminRoutes);



//Routes for HOD
app.use('/api/hod', hodRoutes,HodLogin);



// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
