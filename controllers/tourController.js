const AppError = require('../error/app-error');
const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/api-features');
const handlerFactory = require('./handlerFactory');

const getAllTours = async (req, res) => {

    try {
        // Build query
        const features = await new APIFeatures(Tour, req.query)
            .filter()
            .sort()
            .limit()
            .page();

        const tours = await features.query;
        // const tours = await features.query.explain();

        res.status(200).json({
            status: 'success',
            results: tours.length,
            data: {
                tours
            }
        })
    } catch (error) {
        next(error);
    }

};

const getTourById = handlerFactory.getOne(Tour, 'reviews');

const deleteTour = handlerFactory.deleteOne(Tour);

const createTour = async (req, res, next) => {
    try {
        const newTour = await Tour.create(req.body);

        res.status(201).json(
            {
                status: 'success',
                data: {
                    tour: newTour
                }
            }
        )
    } catch (error) {
        next(error);
    }
};

const updateTour = async (req, res, next) => {
    const tourId = req.params.id;

    try {
        const updatedTour = await Tour.findByIdAndUpdate(tourId, req.body, { new: true, runValidators: true });
        res.status(200).json({
            status: 'success',
            data: {
                tour: updatedTour
            }
        });
    } catch (error) {
        next(error);
    }
};

const getTopFiveCheap = (req, res, next) => {
    req.query.sort = 'price';
    req.query.page = 1;
    req.query.size = 5;
    next();
}

const getTourStats = async (req, res, next) => {
    try {
        const stats = await Tour.aggregate([
            {
                $match: { ratingsAverage: { $gte: 4.5 } }
            },
            {
                $group: {
                    _id: { $toUpper: '$difficulty' },
                    numTours: { $sum: 1 },
                    numRatings: { $sum: '$ratingsQuantity' },
                    avgRating: { $avg: '$ratingsAverage' },
                    avgPrice: { $avg: '$price' },
                    minPrice: { $min: '$price' },
                    maxPrice: { $max: '$price' }
                }
            },
            {
                $sort: { avgPrice: 1 }
            }
        ]);

        res.status(200).json({
            status: 'success',
            data: {
                stats
            }
        });
    } catch (error) {
        next(error);
    }
};

const getMonthlyPlan = async (req, res, next) => {
    try {
        const year = req.params.year * 1; // 2021

        const plan = await Tour.aggregate([
            {
                $unwind: '$startDates'
            },
            {
                $match: {
                    startDates: {
                        $gte: new Date(`${year}-01-01`),
                        $lte: new Date(`${year}-12-31`)
                    }
                }
            },
            {
                $group: {
                    _id: { $month: '$startDates' },
                    numTourStarts: { $sum: 1 },
                    tours: { $push: '$name' }
                }
            },
            {
                $addFields: { month: '$_id' }
            },
            {
                $project: {
                    _id: 0
                }
            },
            {
                $sort: { numTourStarts: -1 }
            },
            {
                $limit: 12
            }
        ]);

        res.status(200).json({
            status: 'success',
            data: {
                plan
            }
        });
    } catch (error) {
        next(error);
    }
};

const getToursWithin = async (req, res, next) => {
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

    if (!lat || !lng) {
        next(new AppError('Please provide latitude and longitude in the format lat,lng.', 400));
    }

    try {
        const tours = await Tour.find({
            startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
        });

        res.status(200).json({
            status: 'success',
            results: tours.length,
            data: {
                data: tours
            }
        });
    } catch (error) {
        return next(error);
    }
};

const getDistances = async (req, res, next) => {
    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

    if (!lat || !lng) {
        next(new AppError('Please provide latitude and longitude in the format lat,lng.', 400));
    }

    try {
        const distances = await Tour.aggregate([
            {
                $geoNear: {
                    near: {
                        type: 'Point',
                        coordinates: [lng * 1, lat * 1]
                    },
                    distanceField: 'distance',
                    distanceMultiplier: multiplier
                }
            },
            {
                $project: {
                    distance: 1,
                    name: 1
                }
            }
        ]);

        res.status(200).json({
            status: 'success',
            data: {
                data: distances
            }
        });
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    getAllTours,
    getTourById,
    createTour,
    updateTour,
    deleteTour,
    getTopFiveCheap,
    getTourStats,
    getMonthlyPlan,
    getToursWithin,
    getDistances
}