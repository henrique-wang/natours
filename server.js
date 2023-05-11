const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: './config.env' });

// Handle uncaught errors
process.on('uncaughtException', error => {
    console.log('Uncaught Exception error:', error);
    process.exit(1);
});

const app = require('./app');

const DB = process.env.MONGO_DB_URI;

mongoose
    .connect(DB, {
        authSource: "admin",
        user: `${process.env.MONGO_DB_USER}`,
        pass: `${process.env.MONGO_DB_PASS}`,
        useNewUrlParser: true
    })
    .then(() => console.log('DB connection successful!'));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});


// Handle Promise errors
process.on('unhandledRejection', (reason, promise) => {
    console.log('Unhandled Rejection at:', promise, 'reason:', reason);
    server.close(() => {
        process.exit(1);
    })
});