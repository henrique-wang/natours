const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');

const authController = require('./controllers/authController');

const errorHandler = require('./error/errorHandler');
const AppError = require('./error/app-error');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// EXTERNAL MIDDLEWARES
// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Add security headers
app.use(helmet());

// Limit number of calls in a single API
const limiter = rateLimit({
    max: process.env.LIMITER_MAX_CALLS,
    windowMs: process.env.LIMITER_WINDOW,
    message: 'Too many requests for this IP. Try again later.'
});
app.use('/api', limiter);

// Body parser
app.use(express.json({ limit: '10kb' }));
app.use(morgan('dev'));

// Data sanitization - NOSQL query injection
app.use(mongoSanitize());

// Data sanitization - XSS
app.use(xss());

// Preventing parameter pollution
app.use(hpp({
    whitelist: [
        'duration',
        'price',
        'ratingsAverage',
        'ratingsQuantity',
        'maxGroupSize'
    ]
}));

// Set req.cookies
app.use(authController.getCookies);

// ROUTES
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

// 404 - PAGE NOT FOUND ERROR HANDLER
// MUST be after all routes
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find page ${req.originalUrl}.`, 404));
})

// GENERIC ERROR HANDLER
app.use(errorHandler);

module.exports = app;