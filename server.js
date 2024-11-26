const express = require('express');
const mongoose = require('mongoose');
const hodRoutes = require('./MasterAdmin_routes/hodRoutes');
const FacultyRoutes = require('./MasterAdmin_routes/FacultyRoutes');
const masterAdminRoutes = require('./MasterAdmin_routes/MasterAdminRoutes')
const connectDB = require('../shared/database/db')

const app = express();

// Middleware
app.use(express.json());

// Database Connection
connectDB();

// Routes
app.use('/api/hod', hodRoutes);
app.use('/api/faculty', FacultyRoutes);
app.use('/api/masterAdmin', masterAdminRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
