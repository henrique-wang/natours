const express = require('express');

const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/', authController.isLoggedIn, viewController.getHomePage);
router.get('/tour/:slug', authController.isLoggedIn, viewController.getTourPage);
router.get('/login', authController.isLoggedIn, viewController.getLoginPage);
router.get('/me', authController.isLoggedIn, viewController.getAccount);
router.get('/my-bookings', authController.isLoggedIn, viewController.getMyBookingsPage);
router.get('/my-bookings/:bookingId', authController.isLoggedIn, viewController.getMyBookingByIdPage);

module.exports = router;