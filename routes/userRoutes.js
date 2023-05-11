const express = require('express');

const userController = require('./../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

router.route('/signup').post(authController.signUp);
router.route('/login').post(authController.login);
router.route('/logout').get(authController.logout);

router.route('/forgot-password').post(authController.forgotPassword);
router.route('/reset-password/:token').patch(authController.resetPassword);
router.route('/update-password').patch(authController.tokenValidation, authController.updatePassword);

router.route('/update-logged-user').patch(authController.tokenValidation, userController.uploadUserPhoto, userController.resizeUserPhoto, userController.updateLoggedUser);
router.route('/delete-logged-user').delete(authController.tokenValidation, userController.deleteLoggedUser)
router.route('/get-logged-user').get(authController.tokenValidation, userController.getLoggedUser, userController.getUserById);

router.route('/')
    .get(authController.tokenValidation, authController.restrictTo('admin'), userController.getAllUsers)
    .post(authController.tokenValidation, authController.restrictTo('admin'), userController.createUser);

router.route('/:id')
    .get(authController.tokenValidation, authController.restrictTo('admin'), userController.getUserById)
    .patch(authController.tokenValidation, authController.restrictTo('admin'), userController.updateUser)
    .delete(authController.tokenValidation, authController.restrictTo('admin'), userController.deleteUser);

module.exports = router;