const express = require('express');

const authController = require('./../controllers/authController');
const reviewController = require('../controllers/reviewController');

const router = express.Router({ mergeParams: true });

router.route('/')
    .get(reviewController.getAllReviews)
    .post(authController.tokenValidation, authController.restrictTo('user'), reviewController.createReview);

router.route('/:id')
    .get(authController.tokenValidation, authController.restrictTo('admin', 'user'), reviewController.getReviewById)
    .delete(authController.tokenValidation, authController.restrictTo('admin', 'user'), reviewController.deleteReview)
    .patch(authController.tokenValidation, authController.restrictTo('admin', 'user'), reviewController.updateReview);

module.exports = router;