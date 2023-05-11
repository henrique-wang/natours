const Review = require('../models/reviewModel');
const handlerFactory = require('./handlerFactory');

const getAllReviews = async (req, res, next) => {
    try {
        let filter = {};

        // Nested GET /tours/:tourId/reviews case
        if (req.params.tourId) filter = { tour: req.params.tourId };

        const reviews = await Review.find(filter);

        res.status(200).json({
            status: 'success',
            results: reviews.length,
            data: {
                reviews
            }
        });
    } catch (error) {
        return next(error);
    }
};

const getReviewById = handlerFactory.getOne(Review);

const createReview = async (req, res, next) => {
    try {
        if (!req.body.tour) req.body.tour = req.params.tourId;  // For nested routes

        const userId = req.user._id;    // Get reviewer user_id from tokenValidation

        const reviewBody = {
            review: req.body.review,
            rating: req.body.rating,
            createdAt: req.body.createdAt,
            tour: req.body.tour,
            user: userId
        };

        const newReview = await Review.create(reviewBody);

        res.status(201).json(
            {
                status: 'success',
                data: {
                    tour: newReview
                }
            }
        );
    } catch (error) {
        return next(error);
    }
};

const deleteReview = async (req, res, next) => {
    const reviewId = req.params.id;
    try {
        const deletedReview = await Review.findByIdAndDelete(reviewId);

        // Update tour ratingsAverage and ratingsQuantity everytime a review is deleted
        await Review.calcAverageRatings(deletedReview.tour);

        res.status(204).json({
            status: 'success',
            data: undefined
        });
    } catch (error) {
        next(error);
    }
};

const updateReview = async (req, res, next) => {
    const reviewId = req.params.id;

    try {
        // Update review
        const updatedReview = await Review.findByIdAndUpdate(reviewId, req.body, { new: true, runValidators: true });

        // Update tour ratingsAverage and ratingsQuantity everytime a review is updated
        await Review.calcAverageRatings(updatedReview.tour);

        // Create success response
        res.status(200).json({
            status: 'success',
            data: {
                data: updatedReview
            }
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getAllReviews,
    getReviewById,
    createReview,
    deleteReview,
    updateReview
}