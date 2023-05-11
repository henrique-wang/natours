const AppError = require("./app-error");

const errorHandler = (error, req, res, next) => {
    error.statusCode = error.statusCode || 500;
    error.status = error.status || 'error';

    console.error('ERROR:', error);

    let err = handleMongooseErrors(error);
    err = handleJwtErrors(err);

    if (req.originalUrl.startsWith('/api')) {
        if (err.isOperational) {
            res.status(err.statusCode).json({
                status: 'fail',
                message: err.message
            });
        } else {
            res.status(err.statusCode).json({
                status: 'error',
                message: 'Internal Error'
            });
        }
    } else {
        // FRONT ERROR
        res.status(err.statusCode).render('error', {
            title: 'Something went wrong!',
            msg: err.message
        });
    }
}

const handleMongooseErrors = (error) => {
    let errorMessage;
    // Invalid ID
    if (error.name === 'CastError') {
        errorMessage = `Invalid value (${error.value}) for ${error.path}.`;
        return new AppError(errorMessage, 400);
    }

    // Duplicated value error
    if (error.name === 'MongoServerError' && error.code === 11000) {
        errorMessage = `Duplicated value ${JSON.stringify(error.keyValue)}`;
        return new AppError(errorMessage, 400);
    }

    // Schema validation error
    if (error.name === 'ValidationError') {
        errorMessage = error.message;
        return new AppError(errorMessage, 400);
    }
    return error;
}

const handleJwtErrors = error => {
    let errorMessage;

    // Invalid signature
    if (error.name === 'JsonWebTokenError') {
        errorMessage = `Invalid token. Please log in.`;
        return new AppError(errorMessage, 401);
    }

    if (error.name === 'TokenExpiredError') {
        errorMessage = `Token expired. Please log in.`;
        return new AppError(errorMessage, 401);
    }

    return error;
}

module.exports = errorHandler;