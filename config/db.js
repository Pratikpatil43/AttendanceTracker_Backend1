const mongoose = require('mongoose');
const { MONGO_URI } = require('./env.config');

const connectDB = async () =>{
    try {
        const options = {
            useNewUrlParser: true, // To use the new MongoDB connection string parser
            useUnifiedTopology: true, // Use the new topology engine
            socketTimeoutMS: 45000, // Timeout for socket operations (in milliseconds)
            connectTimeoutMS: 30000, // Timeout for the initial connection (in milliseconds)
            serverSelectionTimeoutMS: 5000, // Timeout for server selection (in milliseconds)
            writeConcern: {
              w: 'majority', // Ensures data consistency by writing to the majority of nodes
            },
          };
        await mongoose.connect(MONGO_URI,options,{
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB Connected Successfully');
    } catch (error) {
        console.error('Database connection error:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;