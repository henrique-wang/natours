const multer = require('multer');
const sharp = require('sharp');

const AppError = require('../error/app-error');
const User = require('../models/userModel');
const APIFeatures = require('../utils/api-features');
const handlerFactory = require('./handlerFactory');
const paramsUtils = require('../utils/request-params-utils');

const getAllUsers = async (req, res, next) => {
    try {
        // Build query
        const features = await new APIFeatures(User, req.query)
            .filter()
            .sort()
            .limit()
            .page();

        const users = await features.query;

        res.status(200).json({
            status: 'success',
            results: users.length,
            data: {
                users
            }
        })
    } catch (error) {
        next(error);
    }
};

const getUserById = handlerFactory.getOne(User);

const createUser = (req, res) => {
    res.status(500).json({
        status: 'Route not implemented yet.'
    });
};

const updateUser = handlerFactory.updateOne(User);

const deleteUser = (req, res) => {
    res.status(500).json({
        status: 'Route not defined. Please use /signup.'
    });
};

const updateLoggedUser = async (req, res, next) => {
    try {
        // 1) Check if password and passwordConfirmation are in request.body
        if (req.body.password || req.body.passwordConfirmation) {
            return next(new AppError('Password changes are not allowed in this endpoint. Please use /update-password.', 400));
        }

        // 2) Get data that should be updated
        const updatedParams = {
            name: req.body.name,
            email: req.body.email,
            photo: req?.file?.filename
        };

        const updatedData = paramsUtils.filterUndefinedValuesObject(updatedParams);

        // 3) Update user data. Must not be used for password changes
        const loggedUser = await User.findByIdAndUpdate(req.user._id, updatedData, {
            new: true,
            runValidators: true
        });

        // 4) Send result
        res.status(201).json({
            status: 'success',
            user: loggedUser
        });
    } catch (error) {
        return next(error);
    }
}

const deleteLoggedUser = async (req, res, next) => {
    try {
        // 1) Set User.active to false
        await User.findByIdAndUpdate(req.user._id, { active: false }, {
            new: true,
            runValidators: true
        });

        // 2) Send result
        res.status(204).json({
            status: 'success',
            data: null
        })
    } catch (error) {
        return next(error);
    }
};

const getLoggedUser = (req, res, next) => {
    req.params.id = req.user.id;
    next()
};

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new AppError('Not an image! Please upload only images.', 400), false);
    }
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

const uploadUserPhoto = upload.single('photo');

const resizeUserPhoto = async (req, res, next) => {
    if (!req.file) return next();

    try {
        req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

        await sharp(req.file.buffer)
            .resize(500, 500)
            .toFormat('jpeg')
            .jpeg({ quality: 90 })
            .toFile(`public/img/users/${req.file.filename}`);
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    updateLoggedUser,
    deleteLoggedUser,
    getLoggedUser,
    uploadUserPhoto,
    resizeUserPhoto
}