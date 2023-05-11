const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const User = require('../models/userModel');
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const AppError = require('../error/app-error');

const getCheckoutSession = async (req, res, next) => {
    // GET User from tokenValidation middleware
    const user = req.user;

    try {
        // 1) Get the currently booked tour
        const tour = await Tour.findById(req.params.tourId);

        // 2) Create booking (status = PAYMENT_PENDING)
        const price = tour.price;
        const booking = await Booking.create({ tour, user, price });

        // 2) Create checkout session - STRIPE
        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            payment_method_types: ['card'],
            success_url: `${req.protocol}://${req.get('host')}/my-bookings/${booking.id}`,
            cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
            customer_email: req.user.email,
            client_reference_id: booking.id,
            line_items: [
                {
                    quantity: 1,
                    price_data: {
                        currency: 'usd',
                        unit_amount: tour.price * 100,
                        product_data: {
                            name: `${tour.name} Tour`,
                            description: tour.summary,
                            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
                        }
                    }
                }
            ]
        });

        // 3) Create session as response
        res.status(200).json({
            status: 'success',
            redirectTo: session.url
        });
    } catch (error) {
        next(error);
    }
};

const getLoggedUserBookings = async (req, res, next) => {
    try {
        // GET User from tokenValidation middleware
        const user = req.user;

        // 1) Find user bookings
        const bookings = await Booking.find({
            user: user.id
        });

        // 2) Find tours with the returned IDs
        const tourIDs = bookings.map(el => el.tour);
        const tours = await Tour.find({ _id: { $in: tourIDs } });

        // 3) Send tours list
        res.status(200).json({
            status: 'success',
            data: tours
        });
    } catch (error) {
        next(error);
    }
};

const getBookingById = async (req, res, next) => {
    const bookingId = req.params.bookingId;

    try {
        // GET User from tokenValidation middleware
        const user = req.user;

        // 1) Find booking by bookingId
        const booking = await Booking.findById(bookingId);

        // 2) Check if booking is from User
        if (!booking || booking.user.id !== user.id) return next(new AppError('Page not found', 404));

        // 3) Find tours with the returned IDs
        const tour = await Tour.find({ _id: booking.tour.id });

        // If tour not found by BookingId and User
        if (!tour) return next(new AppError('Page not found', 404));

        // 4) Send tours list
        res.status(200).json({
            status: 'success',
            tour
        });
    } catch (error) {
        next(error);
    }
};

const webhookCheckout = async (req, res, next) => {
    let event;
    let session;

    try {
        // Check webhook stripe signature (DISABLED for DEVELOPMENT)
        if (process.env.NODE_ENV === 'development') {
            event = req.body;
        } else {
            const sig = request.headers['stripe-signature'];
            event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
        }

        session = event.data.object;
    } catch (error) {
        res.status(400).send(`Webhook Error: ${error.message}`);
        return;
    }

    const bookingId = session.client_reference_id;
    const user = (await User.findOne({ email: session.customer_email })).id;
    const price = session.amount_total / 100;

    // Handle the event
    switch (event.type) {
        case 'checkout.session.async_payment_succeeded':
            updateBookingStatus(bookingId, user, price, 'PAYMENT_COMPLETED');
            break;
        case 'checkout.session.expired':
            updateBookingStatus(bookingId, user, price, 'CANCELED');
            break;
        case 'checkout.session.async_payment_failed':
            updateBookingStatus(bookingId, user, price, 'PAYMENT_REJECTED');
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    res.send();
};

const updateBookingStatus = async (bookingId, user, price, status) => {
    const booking = await Booking.find({ _id: bookingId, user: user, price: price });
    if (booking) {
        await Booking.findByIdAndUpdate(bookingId, { status });
    }
    return booking;
}

module.exports = {
    getCheckoutSession,
    getLoggedUserBookings,
    getBookingById,
    webhookCheckout
}