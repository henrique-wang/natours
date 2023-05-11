const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Booking must belong to a Tour!']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Booking must belong to a User!']
    },
    price: {
        type: Number,
        require: [true, 'Booking must have a price.']
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    status: {
        type: String,
        default: 'PAYMENT_PENDING',
        enum: ['PAYMENT_PENDING', 'PAYMENT_COMPLETED', 'PAYMENT_REJECTED', 'CANCELLED'],
        require: [true, 'Booking status must be informed.']
    }
});

bookingSchema.pre(/^find/, function (next) {
    this.populate('user').populate({
        path: 'tour',
        select: 'name'
    });
    next();
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;