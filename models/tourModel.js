const mongoose = require('mongoose');
const slugify = require('slugify')

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'tour.name is required.'],
        unique: true,
        trim: true
    },
    duration: {
        type: Number,
        required: [true, 'tour.durations is required']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'tour.maxGroupSize is required']
    },
    difficulty: {
        type: String,
        required: [true, 'tour.difficulty is required'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Difficulty must be easy, medium or difficult'
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [0, 'tour.ratingsAverage must be equal or greater than 0'],
        max: [5, 'tour.ratingsAverage must be equal or lower than 0'],
        set: val => Math.round(val * 10) / 10
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    slug: {
        type: String
    },
    price: {
        type: Number,
        required: [true, 'tour.price is required.']
    },
    priceDiscount: {
        type: Number
    },
    summary: {
        type: String,
        trim: true,
        required: [true, 'tour.summary is required.']
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        trim: true,
        required: [true, 'tour.imageCover is required.']
    },
    images: [String],
    createdAt: {
        type: Date,
        // select: false // Doesnt show after query
        default: Date.now()
    },
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false
    },
    startLocation: {
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String
    },
    locations: [
        {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number
        }
    ],
    guides: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }
    ]
},
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7;
});

// Virtual populate
tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id'
});

// Indexes
tourSchema.indexes({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

// PRE Middleware
tourSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true });
    next();
})

// QUERY MIDDLEWARE
// tourSchema.pre('find', function(next) {
tourSchema.pre(/^find/, function (next) {        // Use of regex - for every query that starts with find
    this.find({ secretTour: { $ne: true } });    // Find every tour which secretTour isnt true

    this.start = Date.now();
    next();
});

tourSchema.post(/^find/, function (docs, next) {
    console.log(`Query took ${Date.now() - this.start} milliseconds!`);
    next();
});

tourSchema.pre(/^find/, function (next) {        // Use of regex - for every query that starts with find
    this.populate({
        path: 'guides',                          // Which object should be populate
        select: '-__v -passwordChangedAt'        // Parameters that won't be listed
    });
    next();
});

// AGGREGATION MIDDLEWARE
// tourSchema.pre('aggregate', function (next) {
//     this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });

//     console.log(this.pipeline());
//     next();
// });

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;