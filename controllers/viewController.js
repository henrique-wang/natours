const Tour = require('../models/tourModel');
const AppError = require('../error/app-error');
const Booking = require('../models/bookingModel');
const axios = require('axios');

const getHomePage = async (req, res, next) => {
    try {
        // Get all tours
        const tours = await Tour.find();

        // Build and render overview page
        res.setHeader('Content-Security-Policy', 'form-action https://checkout.stripe.com/*');
        res.status(200).render('overview', {
            title: 'Tour overview',
            tours
        });
    } catch (error) {
        return next(error);
    }

};

const getTourPage = async (req, res, next) => {
    const slug = req.params.slug;

    try {
        const tour = await Tour.findOne({ slug: slug }).populate({
            path: 'reviews',
            fields: 'review rating user'
        });

        if (!tour) return next(new AppError('Page not found', 404));

        res.setHeader('Content-Security-Policy', 'form-action https://checkout.stripe.com/*');
        res.status(200).render('tour', {
            tour,
            title: tour.name
        });
    } catch (error) {
        return next(error);
    }
};

const getLoginPage = (req, res) => {
    res.status(200).render('login');
}

const getAccount = (req, res) => {
    res.status(200).render('account', {
        title: 'Your account'
    });
};

const getMyBookingsPage = async (req, res, next) => {
    try {
        const response = await axios({
            method: 'GET',
            url: 'http://127.0.0.1:3001/api/v1/bookings/logged-user-bookings'
        });

        const tours = response.data;

        res.status(200).render('overview', {
            title: 'My Tours',
            tours
        });
    } catch (error) {
        next(error);
    }
}

const getMyBookingByIdPage = async (req, res, next) => {
    const bookingId = req.params.bookingId;
    try {
        const response = await axios({
            method: 'GET',
            url: `http://127.0.0.1:3001/api/v1/bookings/logged-user-bookings/${bookingId}`,
            headers: { cookie: req.headers.cookie }
        },
        );

        const tours = response.data.tour;

        res.status(200).render('overview', {
            title: 'My Tours',
            tours
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getHomePage,
    getTourPage,
    getLoginPage,
    getAccount,
    getMyBookingsPage,
    getMyBookingByIdPage
}