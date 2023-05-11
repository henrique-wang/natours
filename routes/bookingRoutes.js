const express = require('express');

const authController = require('./../controllers/authController');
const bookingController = require('../controllers/bookingController');

const router = express.Router();

router.post('/webhook-checkout', bookingController.webhookCheckout);

router.use(authController.tokenValidation);

router.get('/checkout-session/:tourId', bookingController.getCheckoutSession);
router.get('/logged-user-bookings', bookingController.getLoggedUserBookings);
router.get('/logged-user-bookings/:bookingId', bookingController.getBookingById);

module.exports = router;