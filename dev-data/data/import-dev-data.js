const dotenv = require('dotenv');
const mongoose = require('mongoose');
const fs = require('fs');

const Tour = require('../../models/tourModel');
const Review = require('../../models/reviewModel');
const User = require('../../models/userModel');

dotenv.config({ path: './config.env' });

const DB = process.env.MONGO_INITDB_LOCAL_URI;

mongoose
    .connect(DB, {
        authSource: "admin",
        user: "root",
        pass: "root",
        useNewUrlParser: true
    })
    .then(() => console.log('DB connection successful!'));

// Read Json file
const toursDev = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const reviewsDev = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));
const usersDev = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));

// Import data
const importData = async (collections) => {
    try {
        if (collections.includes('tour') || collections.length === 0) await Tour.create(toursDev);
        if (collections.includes('review') || collections.length === 0) await Review.create(reviewsDev);
        if (collections.includes('user') || collections.length === 0) await User.create(usersDev, { validateBeforeSave: false });
        console.log('Dev data was imported!!!');
    } catch (error) {
        console.log(error);
    } finally {
        process.exit();
    }
}

// Delete data
const deleteData = async (collections) => {
    try {
        if (collections.includes('tour') || collections.length === 0) await Tour.deleteMany();
        if (collections.includes('review') || collections.length === 0) await Review.deleteMany();
        if (collections.includes('user') || collections.length === 0) await User.deleteMany();
        console.log('Dev data was imported!!!');
    } catch (error) {
        console.log(error);
    } finally {
        process.exit();
    }
}

// Prompt command
console.log(process.argv);

let collections;
if (process.argv[3]) {
    const collectionsArg = process.argv[3].replace('collections=', "");
    collections = collectionsArg.split(',');
} else {
    collections = [];
}

if (process.argv[2] == '--import') {
    process.env.NODE_ENV = 'IMPORT_DATA';
    importData(collections);
} if (process.argv[2] == '--delete') {
    deleteData(collections);
}