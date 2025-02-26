const UserModel = require("../../model/user");
const constants = require("../../../config/constants");
const bcrypt = require("bcrypt");
const moment = require("moment")
const { generateOTP, deleteFilesIfAnyValidationError, deleteLocalFile, sendOtpEmail } = require("../../helpers/helper");
const { addTimeToCurrentTimestamp } = require("../../helpers/dateFormat.helper");
const { userViewTransformer } = require("../../transformer/user.tranformer");
const responseHelper = require("../../helpers/response.helper");
const path = require("path");
const { listViewUser } = require("../../service/admin/user.service")
const { ENVIRONMENT } = require("../../../config/key");

module.exports.register = async (req, res) => {
    try {
        const reqBody = req.query;

        const checkEmailExist = await UserModel.findOne({ email: reqBody.email, status: constants.STATUS.ACTIVE });
        if (checkEmailExist) {
            await deleteFilesIfAnyValidationError(req?.files ? req.files : {});
            return responseHelper.successapi(res, res.__('emailAlreadyExist'), constants.META_STATUS.NO_DATA, constants.WEB_STATUS_CODE.OK);
        }
        const checkUserNameExist = await UserModel.findOne({ userName: reqBody.userName, isVerified: true, status: constants.STATUS.ACTIVE });
        if (checkUserNameExist) {
            await deleteFilesIfAnyValidationError(req?.files ? req.files : {});
            return responseHelper.successapi(res, res.__('userNameAlreadyExist'), constants.META_STATUS.NO_DATA, constants.WEB_STATUS_CODE.BAD_REQUEST.OK);
        }
        if (reqBody.password !== reqBody.confirmPassword) {
            await deleteFilesIfAnyValidationError(req?.files ? req.files : {});
            return responseHelper.successapi(res, res.__('passwordAndConfirmPasswordDidNotMatch'), constants.META_STATUS.NO_DATA, constants.WEB_STATUS_CODE.BAD_REQUEST);
        }

        reqBody.profileImage = req?.files?.profileImage ? req?.files?.profileImage?.[0]?.filename : '';
        reqBody.password = await bcrypt.hash(reqBody.password, 10);

        const userDetails = new UserModel(reqBody);

        // Send otp
        userDetails.otp = generateOTP(ENVIRONMENT);;
        userDetails.otpExpiresAt = addTimeToCurrentTimestamp(constants.OTP.EXPIRES_IN, 'minutes');

        await userDetails.save();

        if (reqBody?.deviceToken) {
            const userToken = new UserTokenModel()
            userToken.userId = userDetails._id;
            userToken.deviceToken = reqBody.deviceToken;
            await userToken.save()
        }

        //send mail
        await sendOtpEmail({
            email: userDetails.email,
            fullName: `${userDetails.firstName} ${userDetails.lastName}`,
            otp: userDetails.otp,
            subject: 'Verification code',
            path: path.join(__dirname, '../../views/emails/', 'otp-verification.ejs'),
        });


        const response = userViewTransformer(userDetails)
        return responseHelper.successapi(res, res.__('userRegister'), constants.META_STATUS.DATA, constants.WEB_STATUS_CODE.OK, response);

    } catch (err) {
        console.log(`Error(register)`, err);
        return responseHelper.error(res, res.__("somethingWentWrongPleaseTryAgain"), constants.WEB_STATUS_CODE.SERVER_ERROR)

    }
};

module.exports.verifyUser = async (req, res) => {
    try {
        const reqBody = req.body;

        let user = await UserModel.findOne({
            email: reqBody.email,
            status: { $ne: constants.STATUS.DELETED }
        });

        if (!user) return responseHelper.successapi(res, res.__('userNotFound'), constants.META_STATUS.NO_DATA, constants.WEB_STATUS_CODE.OK);

        if (moment().isAfter(user.otpExpiresAt)) return responseHelper.successapi(res, res.__('otpHasBeenExpired'), constants.META_STATUS.NO_DATA, constants.WEB_STATUS_CODE.OK);

        if (reqBody.otp !== user.otp) return responseHelper.successapi(res, res.__('invalidOtp'), constants.META_STATUS.NO_DATA, constants.WEB_STATUS_CODE.OK);

        user.isVerified = true;
        user.otp = 0;
        user.otpExpiresAt = 0
        await user.save();

        let token = await user.generateAuthToken();

        const response = userViewTransformer(user)

        //send mail
        await sendOtpEmail({
            email: response.email,
            fullName: `${response.firstName} ${response.lastName}`,
            subject: 'Welcome to LRF-master',
            path: path.join(__dirname, '../../views/emails/', 'welcome-user.ejs'),
        });

        return responseHelper.successapi(res, res.__('userVerified'), constants.META_STATUS.DATA, constants.WEB_STATUS_CODE.OK, response, {
            token: token,
            isVerified: user.isVerified
        });
    } catch (err) {
        console.log(`Error(verifyUser)`, err);
        return responseHelper.error(res, res.__("somethingWentWrongPleaseTryAgain"), constants.WEB_STATUS_CODE.SERVER_ERROR)

    }
};

module.exports.login = async (req, res) => {
    try {
        let reqBody = req.body;

        let existingUser = await UserModel.findOne({ email: reqBody.email, status: constants.STATUS.ACTIVE });
        if (!existingUser) return responseHelper.successapi(res, res.__('emailOrPasswordWrong'), constants.META_STATUS.NO_DATA, constants.WEB_STATUS_CODE.OK);

        const validPassword = await bcrypt.compare(reqBody.password, existingUser.password);
        if (!validPassword) return responseHelper.successapi(res, res.__('emailOrPasswordWrong'), constants.META_STATUS.NO_DATA, constants.WEB_STATUS_CODE.OK);

        let token = await existingUser.generateAuthToken();

        if (reqBody?.deviceToken) {
            await UserTokenModel.updateOne({ userId: existingUser._id, status: constants.STATUS.ACTIVE }, {
                $set: {
                    userId: existingUser._id,
                    deviceToken: reqBody.deviceToken
                }
            }, { upsert: true })
        }
        // Send otp
        existingUser.otp = generateOTP(ENVIRONMENT);;
        existingUser.otpExpiresAt = addTimeToCurrentTimestamp(constants.OTP.EXPIRES_IN, 'minutes');

        await existingUser.save();

        const response = userViewTransformer(existingUser);

        if (existingUser.isVerified === false) {
            //send mail
            await sendOtpEmail({
                email: existingUser.email,
                fullName: `${existingUser.firstName} ${existingUser.lastName}`,
                otp: existingUser.otp,
                subject: 'Verification code',
                path: path.join(__dirname, '../../views/emails/', 'otp-verification.ejs'),
            });
        }


        return responseHelper.successapi(res, res.__('userLoggedInSuccessfully'), constants.META_STATUS.DATA, constants.WEB_STATUS_CODE.OK, response,
            {
                token: token,
                isVerified: existingUser.isVerified
            });
    } catch (err) {
        console.log(`Error(login)`, err);
        return responseHelper.error(res, res.__("somethingWentWrongPleaseTryAgain"), constants.WEB_STATUS_CODE.SERVER_ERROR)
    }
};

module.exports.forgotPassword = async (req, res) => {
    try {
        let reqBody = req.body;

        let existingUser = await UserModel.findOne({
            email: reqBody.email,
            status: constants.STATUS.ACTIVE
        });
        if (!existingUser) return responseHelper.successapi(res, res.__('userNotFound'), constants.META_STATUS.NO_DATA, constants.WEB_STATUS_CODE.OK);

        existingUser.otp = generateOTP(ENVIRONMENT);
        existingUser.otpExpiresAt = addTimeToCurrentTimestamp(constants.OTP.EXPIRES_IN, 'minutes');

        await existingUser.save();

        //send mail
        await sendOtpEmail({
            email: existingUser.email,
            fullName: `${existingUser.firstName} ${existingUser.lastName}`,
            otp: existingUser.otp,
            subject: 'Forgot password',
            path: path.join(__dirname, '../../views/emails/', 'forgot-password.ejs'),
        });

        return responseHelper.successapi(res, res.__('otpSendSuccessfully'), constants.META_STATUS.DATA, constants.WEB_STATUS_CODE.OK);
    } catch (err) {
        console.log(`Error(forgotPassword)`, err);
        return responseHelper.error(res, res.__("somethingWentWrongPleaseTryAgain"), constants.WEB_STATUS_CODE.SERVER_ERROR)
    }
};

module.exports.resendOtp = async (req, res) => {
    try {
        let reqBody = req.body;

        let existingUser = await UserModel.findOne({
            email: reqBody.email,
            status: constants.STATUS.ACTIVE
        });
        if (!existingUser) return responseHelper.successapi(res, res.__('userNotFound'), constants.META_STATUS.NO_DATA, constants.WEB_STATUS_CODE.OK);

        existingUser.otp = generateOTP(ENVIRONMENT);
        existingUser.otpExpiresAt = addTimeToCurrentTimestamp(constants.OTP.EXPIRES_IN, 'minutes');

        await existingUser.save();

        //send mail
        await sendOtpEmail({
            email: existingUser.email,
            fullName: `${existingUser?.firstName} ${existingUser?.lastName}`,
            otp: existingUser.otp,
            subject: 'Resend OTP',
            path: path.join(__dirname, '../../views/emails/', 'resend-otp-verification.ejs'),
        });

        return responseHelper.successapi(res, res.__('otpSendSuccessfully'), constants.META_STATUS.DATA, constants.WEB_STATUS_CODE.OK);
    } catch (err) {
        console.log(`Error(resendOtp)`, err);
        return responseHelper.error(res, res.__("somethingWentWrongPleaseTryAgain"), constants.WEB_STATUS_CODE.SERVER_ERROR)
    }
};

module.exports.resetPassword = async (req, res) => {
    try {
        let reqBody = req.body;

        let existingUser = await UserModel.findOne({
            email: reqBody.email,
            status: constants.STATUS.ACTIVE
        });
        if (!existingUser) return responseHelper.successapi(res, res.__('userNotFound'), constants.META_STATUS.NO_DATA, constants.WEB_STATUS_CODE.OK);

        if (moment().isAfter(existingUser.otpExpiresAt)) return responseHelper.successapi(res, res.__('otpHasBeenExpired'), constants.META_STATUS.NO_DATA, constants.WEB_STATUS_CODE.OK);

        if (reqBody.otp != existingUser.otp) return responseHelper.successapi(res, res.__('otpNotValid'), constants.META_STATUS.NO_DATA, constants.WEB_STATUS_CODE.OK);

        existingUser.password = await bcrypt.hash(reqBody.password, 10);
        existingUser.otp = 0;
        existingUser.otpExpiresAt = 0

        await existingUser.save()

        return responseHelper.successapi(res, res.__('passwordChangedSuccessfully'), constants.META_STATUS.DATA, constants.WEB_STATUS_CODE.OK);
    } catch (err) {
        console.log(`Error(resetPassword)`, err);
        return responseHelper.error(res, res.__("somethingWentWrongPleaseTryAgain"), constants.WEB_STATUS_CODE.SERVER_ERROR)
    }
};

module.exports.viewProfile = async (req, res) => {
    try {
        let userId = req.user._id;

        const checkUser = await UserModel.findOne({_id:userId});
        if (!checkUser[0]?.data[0]) return responseHelper.successapi(res, res.__('userNotFound'), constants.META_STATUS.NO_DATA, constants.WEB_STATUS_CODE.OK);

        return responseHelper.successapi(res, res.__('userProfileFoundSuccessFully'), constants.META_STATUS.DATA, constants.WEB_STATUS_CODE.OK, response);
    } catch (err) {
        console.log(`Error(viewProfile)`, err);
        return responseHelper.error(res, res.__("somethingWentWrongPleaseTryAgain"), constants.WEB_STATUS_CODE.SERVER_ERROR)
    }
};

module.exports.editProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const reqBody = req.query;

        let userData = await UserModel.findOne({ _id: userId, status: constants.STATUS.ACTIVE });

        //Check username of user
        const checkUserNameExist = await UserModel.findOne({ userName: reqBody.userName, _id: { $ne: userId }, isVerified: true, status: constants.STATUS.ACTIVE });
        if (checkUserNameExist) {
            await deleteFilesIfAnyValidationError(req?.files ? req.files : {});
            return responseHelper.successapi(res, res.__('userNameAlreadyExist'), constants.META_STATUS.NO_DATA, constants.WEB_STATUS_CODE.BAD_REQUEST.OK);
        }

        let oldImage = userData ? userData.profileImage : ""

        userData.firstName = reqBody.firstName;
        userData.lastName = reqBody.lastName;
        userData.profileImage = req?.files?.profileImage ? await compressImage(req?.files?.profileImage?.[0]?.filename, "user") : userData.profileImage;

        await userData.save();

        if (oldImage && req?.files?.profileImage) deleteLocalFile("user", oldImage)
        const response = userViewTransformer(userData);

        return responseHelper.successapi(res, res.__('profileEditSuccessfully'), constants.META_STATUS.DATA, constants.WEB_STATUS_CODE.OK, response, { isVerified: response.isVerified });

    } catch (err) {
        console.log(`Error(editProfile)`, err);
        return responseHelper.error(res, res.__("somethingWentWrongPleaseTryAgain"), constants.WEB_STATUS_CODE.SERVER_ERROR)
    }
};

//Change Password
module.exports.changePassword = async (req, res) => {
    try {
        let reqBody = req.body;

        let userExist = await UserModel.findOne({ _id: req.user._id, status: constants.STATUS.ACTIVE });
        if (!userExist) return responseHelper.successapi(res, res.__('userNotFound'), constants.META_STATUS.NO_DATA, constants.WEB_STATUS_CODE.OK);

        let isMatch = bcrypt.compareSync(reqBody.oldPassword, userExist.password);
        if (!isMatch) return responseHelper.successapi(res, res.__('oldPasswordDoesNotMatch'), constants.META_STATUS.NO_DATA, constants.WEB_STATUS_CODE.OK);

        if (reqBody.oldPassword === reqBody.password)
            return responseHelper.successapi(res, res.__('oldPasswordAndNewPasswordCanNotBeSame'), constants.META_STATUS.NO_DATA, constants.WEB_STATUS_CODE.OK);

        if (reqBody.password !== reqBody.confirmPassword)
            return responseHelper.successapi(res, res.__('passwordConfirmPasswordNotSame'), constants.META_STATUS.NO_DATA, constants.WEB_STATUS_CODE.OK);

        let newPassword = await bcrypt.hash(reqBody.password, 10);

        userExist.password = newPassword
        await userExist.save()

        return responseHelper.successapi(res, res.__('passwordChangedSuccessfully'), constants.META_STATUS.DATA, constants.WEB_STATUS_CODE.OK);
    } catch (err) {
        console.log('Error(changePassword)', err);
        return responseHelper.error(res, res.__('somethingWentWrongPleaseTryAgain'), constants.WEB_STATUS_CODE.SERVER_ERROR, err);
    }
};

exports.logout = async (req, res) => {
    try {
        let reqBody = req.body;
        let userId = req.user._id;

        return responseHelper.successapi(res, res.__("userLoggedOut"), constants.META_STATUS.DATA, constants.WEB_STATUS_CODE.OK)
    } catch (e) {
        logger.logger.error(`Error from catch: ${e}`);
        return responseHelper.error(res, res.__("somethingWentWrongPleaseTryAgain"), constants.WEB_STATUS_CODE.SERVER_ERROR)
    }
};