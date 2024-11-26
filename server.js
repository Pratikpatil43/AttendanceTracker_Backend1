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

// Routes
app.use('/api/hod', hodRoutes,HodLogin);
app.use('/api/faculty', FacultyRoutes);
app.use('/api/masterAdmin', masterAdminRoutes);



// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
