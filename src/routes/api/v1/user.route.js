const express = require('express');
const router = express.Router();
const userController = require('../../../controller/v1/user.controller');
const { userAuth } = require("../../../middleware/user.auth");
const { validMulterUploadMiddleware, uploadImage } = require('../../../middleware/uploadImage');
const userValidation = require("../../../validations/user.validation");
const { validatorFunction } = require('../../../helpers/response.helper');

router.get('/', (req, res) => res.send('Welcome to User route'));

router.post('/register', validMulterUploadMiddleware(uploadImage), userValidation.registerUserValidation, validatorFunction, userController.register)
router.post('/edit-profile', userAuth, validMulterUploadMiddleware(uploadImage), userController.editProfile)
router.post('/verify-user', userValidation.verifyUserValidation, validatorFunction, userController.verifyUser);
router.post('/resend-otp', userValidation.forgotAndResendOtpValidation, validatorFunction, userController.resendOtp);
router.post('/forgot-password', userValidation.forgotAndResendOtpValidation, validatorFunction, userController.forgotPassword);
router.post('/login', userValidation.loginUserValidation, validatorFunction, userController.login);
router.post('/reset-password', userValidation.resetPasswordValidation, validatorFunction, userController.resetPassword);
router.post('/view-profile', userAuth, userController.viewProfile);
router.post('/change-password', userAuth, userValidation.changePasswordValidation, validatorFunction, userController.changePassword);
router.post('/log-out', userAuth, userController.logout);

module.exports = router;
