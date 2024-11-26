const express = require('express');
const mongoose = require('mongoose');
const hodRoutes = require('./routes/hodRoutes');
const masterAdminRoutes = require('./routes/MasterAdminRoutes')
const connectDB = require('./config/db')

const app = express();

// Middleware
app.use(express.json());

// Database Connection
connectDB();

// Routes
app.use('/api/hod', hodRoutes);
app.use('/api/masterAdmin', masterAdminRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
