const dotenv = require('dotenv');
const mongoose = require('mongoose');
const fs = require('fs');

const Tour = require('../../models/tourModel');
const Review = require('../../models/reviewModel');
const User = require('../../models/userModel');
const Booking = require('../../models/bookingModel');

dotenv.config({ path: './config.env' });

const DB = process.env.MONGO_DB_URI;

mongoose
    .connect(DB, {
        authSource: "admin",
        user: `${process.env.MONGO_DB_USER}`,
        pass: `${process.env.MONGO_DB_PASS}`,
        useNewUrlParser: true
    })
    .then(() => console.log('DB connection successful!'));

// Read Json file
const toursDev = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const reviewsDev = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));
const usersDev = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));

// Import data
const importData = async (documents) => {
    try {
        if (documents.includes('tour') || documents.length === 0) await Tour.create(toursDev);
        if (documents.includes('review') || documents.length === 0) await Review.create(reviewsDev);
        if (documents.includes('user') || documents.length === 0) await User.create(usersDev, { validateBeforeSave: false });
        console.log('Dev data was imported!!!');
    } catch (error) {
        console.log(error);
    } finally {
        process.exit();
    }
}

// Delete data
const deleteData = async (documents) => {
    try {
        if (documents.includes('tour') || documents.length === 0) await Tour.deleteMany();
        if (documents.includes('review') || documents.length === 0) await Review.deleteMany();
        if (documents.includes('user') || documents.length === 0) await User.deleteMany();
        if (documents.includes('booking') || documents.length === 0) await Booking.deleteMany();
        console.log('Dev data was imported!!!');
    } catch (error) {
        console.log(error);
    } finally {
        process.exit();
    }
}

// Prompt command
console.log(process.argv);

let documents;
if (process.argv[3]) {
    const documentsArg = process.argv[3].replace('documents=', "");
    documents = documentsArg.split(',');
} else {
    documents = [];
}

if (process.argv[2] == '--import') {
    process.env.NODE_ENV = 'IMPORT_DATA';
    importData(documents);
} if (process.argv[2] == '--delete') {
    deleteData(documents);
}