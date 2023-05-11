const express = require('express');

const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewRouter = require('../routes/reviewRoutes');

const router = express.Router();

router.use('/:tourId/reviews', reviewRouter);

router.route('/top-5-cheap')
    .get(tourController.getTopFiveCheap, tourController.getAllTours)

router.route('/tour-stats').get(tourController.getTourStats);

router.route('/monthly-plan/:year').get(authController.tokenValidation, authController.restrictTo('admin', 'lead-guide', 'guide'), tourController.getMonthlyPlan);

router.route('/')
    .get(tourController.getAllTours)
    .post(authController.tokenValidation, authController.restrictTo('admin', 'lead-guide'), tourController.createTour);

router.route('/:id')
    .get(tourController.getTourById)
    .patch(authController.tokenValidation, authController.restrictTo('admin', 'lead-guide'), tourController.updateTour)
    .delete(authController.tokenValidation, authController.restrictTo('admin', 'lead-guide'), tourController.deleteTour);

router.route('/tours-within/:distance/center/:latlng/unit/:unit')
    .get(tourController.getToursWithin);

router.route('/distances/:latlng/unit/:unit')
    .get(tourController.getDistances);

module.exports = router;