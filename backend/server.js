const app = require('./src/app');
const connectDB = require('./src/config/db');
require('dotenv').config();

const PORT = process.env.PORT || 4000;

// Connect to MongoDB
connectDB();

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log('Press Ctrl+C to quit.');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
    // Close server & exit process
    process.exit(1);
});
