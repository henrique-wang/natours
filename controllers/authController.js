const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const User = require('../models/userModel');
const AppError = require('../error/app-error');
const Email = require('../utils/email');
const { paramsToObject } = require('../utils/request-params-utils');

const jwtSign = userId => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
}

const createSendToken = (user, statusCode, res) => {
    const token = jwtSign(user._id);

    let cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIES_EXPIRES_IN * 1),
        httpOnly: true,
        secure: true
    }

    // If project is running in development env, set cookie = true (https only)
    if (process.env.NODE_ENV === 'development') cookieOptions.secure = false;

    // Set cookie response
    res.cookie('jwt', token, cookieOptions);

    // Clean user.password before sending
    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
}

const signUp = async (req, res, next) => {
    try {
        const newUser = await User.create(
            {
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                passwordConfirm: req.body.passwordConfirm,
                photo: req.body.photo,
                passwordChangedAt: req.body.passwordChangedAt,
                role: req.body.role
            }
        );

        createSendToken(newUser, 201, res);
    } catch (error) {
        next(error);
    }
}

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return next(new AppError('Please provide email and password.', 400));
        }

        const user = await User.findOne({ email }).select('+password');

        if (!user || !await user.isPasswordValid(password, user.password)) {
            return next(new AppError('Invalid password or email.', 401));
        }

        createSendToken(user, 201, res);
    } catch (error) {
        return next(error);
    }
}

const tokenValidation = async (req, res, next) => {

    try {
        // Check if token was provided
        if (!req.cookies.jwt && (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer'))) {
            return next(new AppError('User is not logged in. Please log in to continue.', 401))
        }

        // Check if token is valid
        let token;
        if (!req.cookies.jwt) {
            token = req.headers.authorization.split(' ')[1];
        } else {
            token = req.cookies.jwt;
        }
        jwt.verify(token, process.env.JWT_SECRET);

        // Check if user provided in token still exists
        const decodedJwt = jwt.decode(token);
        const user = await User.findById(decodedJwt.id);
        if (!user) {
            return next(new AppError('User no longer exists.', 401));
        }

        // Check if user password was changed after token generation
        if (user.passwordChangedAt !== undefined && !user.isTokenValid(decodedJwt.iat)) {
            return next(new AppError('Token has expired. Please log in.', 401));
        }

        // Save user objecto in req
        req.user = user;
        next();
    } catch (error) {
        next(error);
    }

}

const restrictTo = (...roles) => {
    return (req, res, next) => {
        const a = roles.includes('admin');
        if (!roles.includes(req.user.role)) {
            return next(new AppError('User does not have permission to perform this action.', 403));
        }
        next();
    }
}

const forgotPassword = async (req, res, next) => {
    // Find user by email
    if (!req.body.email) return next(new AppError('Email not provided.', 400));

    const user = await User.findOne({ email: req.body.email });

    if (!user) return next(new AppError('Invalid email provided'), 400);

    try {
        // Create passwordResetToken
        const resetToken = user.createPasswordResetToken();

        // Save in the database
        await user.save({ validateBeforeSave: false });

        // Send email to the user
        const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/reset-password/${resetToken}`;
        await new Email(user, resetUrl).sendPasswordReset();

        res.status(200).json({
            status: 'success',
            message: 'Reset password url sent to email!'
        });
    } catch (error) {
        user.passwordResetToken = undefined;
        user.passwordResetTokenExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next(new AppError('Failed to generate reset password url.'), 500);
    }
}

const resetPassword = async (req, res, next) => {
    // 1) Get User by resetPasswordToken
    const encryptedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
        passwordResetToken: encryptedToken,
        passwordResetTokenExpires: { $gt: Date.now() }
    });

    try {
        // 2) If token is not expired and user exists, update new password
        if (!user) return next(new AppError('Invalid or expired token.'), 400);
        user.password = req.body.password;
        user.passwordConfirm = req.body.passwordConfirm;
        user.passwordResetToken = undefined;
        user.passwordResetTokenExpires = undefined;

        // Update user and update passwordChangedAt (middleware)
        await user.save();

        // 3) Log the user in and send a JWT token
        createSendToken(user, 201, res);
    } catch (error) {
        return next(error);
    }
}

const updatePassword = async (req, res, next) => {
    // 1) Get user from collection
    const user = await User.findById(req.user._id).select('+password');

    try {
        // 2) Check if posted password is correct
        if (!user || !await user.isPasswordValid(req.body.currentPassword, user.password)) {
            return next(new AppError('Invalid password.'), 401);
        }

        // 3) Update
        user.password = req.body.password;
        user.passwordConfirm = req.body.passwordConfirm;

        await user.save();

        // 4) Log the user in and send JWT token
        createSendToken(user, 201, res);

    } catch (error) {
        next(error);
    }
};

// Only for rendered pages, no errors!
const isLoggedIn = async (req, res, next) => {
    console.log(req.headers);
    if (req?.cookies?.jwt) {
        try {
            // 1) verify token
            jwt.verify(req.cookies.jwt, process.env.JWT_SECRET);

            // Check if user provided in token still exists
            const decodedJwt = jwt.decode(req.cookies.jwt);
            const user = await User.findById(decodedJwt.id);
            if (!user) {
                return next();
            }

            if (user.passwordChangedAt !== undefined && !user.isTokenValid(decodedJwt.iat)) {
                return next();
            }

            // THERE IS A LOGGED IN USER
            res.locals.user = user;
            return next();
        } catch (err) {
            return next();
        }
    }
    next();
};

const logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({ status: 'success' });
};

// Set req.cookies middleware
const getCookies = (req, res, next) => {
    var cookiesHeader = req.headers.cookie;
    if (cookiesHeader) {
        const cookiesSplit = cookiesHeader.split(';');
        const cookies = paramsToObject(cookiesSplit);
        req.cookies = cookies;
    } else {
        req.cookies = {};
    }
    next();
}

module.exports = {
    signUp,
    login,
    tokenValidation,
    restrictTo,
    forgotPassword,
    resetPassword,
    updatePassword,
    isLoggedIn,
    getCookies,
    logout
}