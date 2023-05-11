const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = mongoose.Schema(
    {
        review: {
            type: String,
            required: [true, 'Review cannot be empty!']
        },
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, 'A review must belong to a user.']
        },
        rating: {
            type: Number,
            min: 1,
            max: 5,
            required: [true, 'rating is missing!']
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        tour: {
            type: mongoose.Schema.ObjectId,
            ref: 'Tour',
            required: [true, 'A review must belong to a tour.']
        }
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Set that the user can only make 1 review per tour
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

// Populate
reviewSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'user',         // Which object should be populate
        select: 'name photo'        // Parameters that will be listed
    });
    next();
});

// Update tour ratingsAverage and ratingsQuantity
reviewSchema.statics.calcAverageRatings = async function (tour) {
    const stats = await this.aggregate([
        {
            $match: { tour: tour }
        },
        {
            $group: {
                _id: '$tour',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ]);

    if (stats.length > 0) {
        await Tour.findByIdAndUpdate(tour, {
            ratingsQuantity: stats[0].nRating,
            ratingsAverage: stats[0].avgRating
        });
    } else {
        await Tour.findByIdAndUpdate(tour, {
            ratingsQuantity: 0,
            ratingsAverage: 4.5
        });
    }
};

// Update tour ratingsAverage and ratingsQuantity everytime a new review is created
reviewSchema.post('save', function () {
    this.constructor.calcAverageRatings(this.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;