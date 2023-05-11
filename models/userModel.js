const mongoose = require('mongoose');
const crypto = require('crypto');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'user.name is required.']
    },
    email: {
        type: String,
        require: [true, 'user.email is required'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    photo: {
        type: String,
        default: 'default.jpg'
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'lead-guide', 'guide'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'user.password is required'],
        minlength: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            validator: function (passwordConfirm) {
                return passwordConfirm === this.password;
            },
            message: 'Password is different from passwordConfirm.'
        }
    },
    passwordChangedAt: {
        type: Date
    },
    passwordResetToken: {
        type: String
    },
    passwordResetTokenExpires: {
        type: Date
    },
    active: {
        type: Boolean,
        default: true,
        select: false
    }

});

// Mongoose middleware - encrypt and save password before saving user
userSchema.pre('save', async function (next) {
    // Importing data to DB - password is already encrypted
    if (process.env.NODE_ENV === 'IMPORT_DATA') return next();

    // If password was not modified
    if (!this.isModified('password')) return next();

    // If password was modified, encrypt and save
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;

    next();
});

// Mongoose middleware - update passwordChangedAt if password is modified and user is not new
userSchema.pre('save', async function (next) {
    // Importing data to DB - password is not modified
    if (process.env.NODE_ENV === 'IMPORT_DATA') return next();

    if (!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000;
    next();
});

// Mongoose middleware - filter only active accounts
userSchema.pre('find', async function (next) {
    this.find({ active: { $ne: false } });
    next();
});

userSchema.methods.isPasswordValid = async function (providedPassword, userPassword) {
    return await bcrypt.compare(providedPassword, userPassword);
};

userSchema.methods.isTokenValid = function (tokenIat) {
    // Token is valid if token iat > passwordChangedAt. In other words, if token was generated after password was updated.
    const passwordChangedAt = Math.floor(this.passwordChangedAt.getTime() / 1000);
    return passwordChangedAt < tokenIat;
};

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetTokenExpires = Date.now() + 600000;

    return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;