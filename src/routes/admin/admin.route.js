const express = require('express');
const router = express.Router();
const adminController = require('../../controller/admin/admin.controller');
const verifyToken = require('../../middleware/user.auth');
const adminValidation = require("../../validations/admin/admin.validation");
const { validatorFunction } = require('../../helpers/response.helper');

router.get('/', (req, res) => res.send('Welcome to admin route'));

//admin
router.post('/login', adminValidation.loginValidation, validatorFunction, adminController.login);
router.post('/view-profile', verifyToken.adminAuth, adminController.viewProfile);
router.post('/edit-profile', verifyToken.adminAuth, adminValidation.editProfileValidation, validatorFunction, adminController.editProfile);
router.post('/forgot-password', adminValidation.forgotPasswordValidation, validatorFunction, adminController.forgotPassword);
router.post('/reset-password', adminValidation.resetPasswordValidation, validatorFunction, adminController.resetPassword);
router.post('/resend-otp', adminValidation.forgotPasswordValidation, validatorFunction, adminController.resendOtp);
router.post('/change-password', verifyToken.adminAuth, adminValidation.changePasswordValidation, validatorFunction, adminController.changePassword);
router.post('/log-out', verifyToken.adminAuth, adminController.logout);

module.exports = router;

