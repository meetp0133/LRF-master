const path = require('path');
const moment = require('moment')
const bcrypt = require('bcrypt')
const Admin = require('../../models/admin.model');
const helper = require('../../helpers/helper.js');
const constants = require('../../../config/constants.js');
const responseHelper = require('../../helpers/helper.js');
const dateFormat = require('../../helpers/helper.js');
const adminTransformer = require('../../transformer/admin.transformer')
const { BASE_URL, ENVIRONMENT } = require('../../../config/key.js');

//Login Admin
exports.login = async (req, res) => {
    try {
        let reqBody = req.body;

        let existingAdmin = await Admin.findOne({ email: reqBody.email, status: constants.STATUS.ACTIVE });
        if (!existingAdmin) return responseHelper.successapi(res, res.__('emailOrPasswordWrong'), constants.META_STATUS.NO_DATA, constants.WEB_STATUS_CODE.OK);

        const validPassword = existingAdmin.validPassword(reqBody.password);
        if (!validPassword) return responseHelper.successapi(res, res.__('emailOrPasswordWrong'), constants.META_STATUS.NO_DATA, constants.WEB_STATUS_CODE.OK);

        let token = await existingAdmin.generateAuthToken();

        const response = adminTransformer.adminTransformer(existingAdmin);
        return responseHelper.successapi(res, res.__('adminLoggedInSuccessfully'), constants.META_STATUS.DATA, constants.WEB_STATUS_CODE.OK, response, { token });
    } catch (e) {
        return responseHelper.error(res, res.__('somethingWentWrongPleaseTryAgain'), constants.WEB_STATUS_CODE.SERVER_ERROR, e);
    }
};

//Forgot Password
exports.forgotPassword = async (req, res) => {
    try {
        let reqBody = req.body;

        //existing admin
        let foundAdmin = await Admin.findOne({ email: reqBody.email, status: constants.STATUS.ACTIVE });
        if (!foundAdmin) return responseHelper.successapi(res, res.__('emailNotExists'), constants.META_STATUS.NO_DATA, constants.WEB_STATUS_CODE.OK);

        //generating otp
        let otp = helper.generateOTP(ENVIRONMENT);
        const expirationTime = dateFormat.addTimeToCurrentTimestamp(3, 'minutes');

        //updating otp
        foundAdmin.otp = otp;
        foundAdmin.expirationTime = expirationTime;

        await foundAdmin.save();

        helper.sendOtpEmail({
            fullName: `${foundAdmin.firstName}`,
            email: foundAdmin.email,
            otp: otp,
            subject: 'Off-Plan Property - Reset Password',
            baseUrl: BASE_URL,
            path: path.join(__dirname, '../views/emails/', 'forgot-password.ejs'),
        });

        return responseHelper.successapi(res, res.__('otpSendSuccessfully'), constants.META_STATUS.DATA, constants.WEB_STATUS_CODE.OK, { expirationTime: 10 });
    } catch (e) {
        return responseHelper.error(res, res.__('somethingWentWrongPleaseTryAgain'), constants.WEB_STATUS_CODE.SERVER_ERROR, e);

    }
};

//Reset Password
exports.resetPassword = async (req, res) => {
    try {
        let reqBody = req.body;

        reqBody.otp = +reqBody.otp;
        console.log(" console.log(:);", reqBody);

        let adminDetails = await Admin.findOne({ email: reqBody.email, status: constants.STATUS.ACTIVE });
        if (!adminDetails)
            return responseHelper.successapi(res, res.__('adminNotFound'), constants.META_STATUS.NO_DATA, constants.WEB_STATUS_CODE.OK);

        if (adminDetails.otp !== reqBody.otp)
            return responseHelper.successapi(res, res.__('otpNotValid'), constants.META_STATUS.NO_DATA, constants.WEB_STATUS_CODE.OK);

        if (moment().isAfter(adminDetails.otpExpiresAt, 'x'))
            return responseHelper.successapi(res, res.__('otpHasBeenExpired'), constants.META_STATUS.NO_DATA, constants.WEB_STATUS_CODE.OK);

        let password = await bcrypt.hash(reqBody.password, 10);

        await Admin.updateOne({ email: reqBody.email, status: constants.STATUS.ACTIVE }, { $set: { password: password } });
        return responseHelper.successapi(res, res.__('passwordChangedSuccessfully'), constants.META_STATUS.DATA, constants.WEB_STATUS_CODE.OK);

    } catch (e) {
        return responseHelper.error(res, res.__('somethingWentWrongPleaseTryAgain'), constants.WEB_STATUS_CODE.SERVER_ERROR, e);

    }
};

//Change Password
exports.changePassword = async (req, res) => {
    try {
        let reqBody = req.body;
        let adminExist = await Admin.findOne({ _id: req.admin._id, status: constants.STATUS.ACTIVE }).lean();
        if (!adminExist) return responseHelper.successapi(res, res.__('adminNotFound'), constants.META_STATUS.NO_DATA, constants.WEB_STATUS_CODE.OK);

        let isMatch = bcrypt.compareSync(reqBody.oldPassword, adminExist.password);
        if (!isMatch) return responseHelper.successapi(res, res.__('oldPasswordDoesNotMatch'), constants.META_STATUS.NO_DATA, constants.WEB_STATUS_CODE.OK);

        if (reqBody.oldPassword === reqBody.password) return responseHelper.successapi(res, res.__('oldPasswordAndNewPasswordCanNotBeSame'), constants.META_STATUS.NO_DATA, constants.WEB_STATUS_CODE.OK);
        let newPassword = await bcrypt.hash(reqBody.password, 10);

        await Admin.updateOne({ _id: req.admin._id }, { password: newPassword });
        return responseHelper.successapi(res, res.__('passwordChangedSuccessfully'), constants.META_STATUS.DATA, constants.WEB_STATUS_CODE.OK);
    } catch (e) {
        return responseHelper.error(res, res.__('somethingWentWrongPleaseTryAgain'), constants.WEB_STATUS_CODE.SERVER_ERROR, e);

    }
};

//View Admin Profile
exports.viewProfile = async (req, res) => {
    try {
        const viewProfile = await Admin.findOne({ _id: req.admin._id, status: constants.STATUS.ACTIVE });
        if (!viewProfile) return responseHelper.successapi(res, res.__('adminNotFound'), constants.META_STATUS.NO_DATA, constants.WEB_STATUS_CODE.OK);

        let responseData = adminTransformer.adminTransformer(viewProfile);
        return responseHelper.successapi(res, res.__('adminFoundSuccessfully'), constants.META_STATUS.DATA, constants.WEB_STATUS_CODE.OK, responseData);
    } catch (e) {
        return responseHelper.error(res, res.__('SomethingWentWrongPleaseTryAgain'), constants.WEB_STATUS_CODE.SERVER_ERROR);
    }
};

//Edit Admin Profile
exports.editProfile = async (req, res) => {
    try {
        let reqBody = req.body;
        console.log("profilePicture req.body ", req.body)

        let emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
        // if (reqBody?.email && !emailRegex.test(reqBody?.email)) {
        //     // return responseHelper.successapi(res, res.__('emailAlreadyInUse'), constants.META_STATUS.NO_DATA, constants.WEB_STATUS_CODE.OK);
        //     return responseHelper.error(res, res.__('validationEmailEmail'), constants.WEB_STATUS_CODE.BAD_REQUEST);
        // }

        if (reqBody.email != req.user.email) {
            let isEmailAlreadyInUse = await Admin.countDocuments({ email: reqBody.email, _id: { $ne: req.user._id } });
            if (isEmailAlreadyInUse) {
                return responseHelper.successapi(res, res.__('emailAlreadyInUse'), constants.META_STATUS.NO_DATA, constants.WEB_STATUS_CODE.OK);
            }
        }

        const foundAdmin = await Admin.findOne({ _id: req.admin._id, status: constants.STATUS.ACTIVE });
        if (!foundAdmin) return responseHelper.successapi(res, res.__('adminNotFound'), constants.META_STATUS.NO_DATA, constants.WEB_STATUS_CODE.OK);


        foundAdmin.firstName = reqBody.firstName ? reqBody.firstName : foundAdmin.firstName;
        foundAdmin.lastName = reqBody.lastName ? reqBody.lastName : foundAdmin.lastName;
        foundAdmin.email = reqBody.email ? reqBody.email : foundAdmin.email;

        if (req?.files?.profilePicture) {
            if (typeof reqBody.profilePicture === "string") {
                foundAdmin.profilePicture = foundAdmin.profilePicture
            } else {
                if (foundAdmin.profilePicture != '') await helper.deleteFile({
                    'name': foundAdmin.profilePicture,
                    folderName: 'admin'
                });

                foundAdmin.profilePicture = await helper.getFileName(req.files.profilePicture[0]);
            }

        }

        await foundAdmin.save();

        let adminDetail = adminTransformer.adminTransformer(foundAdmin);
        return responseHelper.successapi(res, res.__('profileUpdatedSuccessfully'), constants.META_STATUS.DATA, constants.WEB_STATUS_CODE.OK, adminDetail);
    } catch (e) {
        console.log('Error(editProfile)', e);
        return responseHelper.error(res, res.__('SomethingWentWrongPleaseTryAgain'), constants.WEB_STATUS_CODE.SERVER_ERROR);
    }
};

//Resend Otp
exports.resendOtp = async (req, res) => {
    try {
        let reqBody = req.body;

        let otp = helper.generateOTP(ENVIRONMENT);
        const expirationTime = dateFormat.addTimeToCurrentTimestamp(3, 'minutes');

        let foundAdmin = await Admin.findOneAndUpdate({
            email: reqBody.email,
            status: constants.STATUS.ACTIVE
        }, { $set: { otp, otpExpiresAt: expirationTime } });

        if (!foundAdmin) return responseHelper.successapi(res, res.__('adminNotFound'), constants.META_STATUS.NO_DATA, constants.WEB_STATUS_CODE.BAD_REQUEST);

        helper.sendOtpEmail({
            fullName: `${foundAdmin.firstName}`,
            'email': foundAdmin.email,
            'otp': otp,
            'subject': 'Off-Plan Property - Resend Verification Code',
            'baseUrl': BASE_URL,
            'path': path.join(__dirname, '../views/emails/', 'resend-otp-verification.ejs'),
        });

        return responseHelper.successapi(res, res.__('otpSendSuccessfully'), constants.META_STATUS.DATA, constants.WEB_STATUS_CODE.OK);
    } catch (e) {
        return responseHelper.error(res, res.__('somethingWentWrongPleaseTryAgain'), constants.WEB_STATUS_CODE.SERVER_ERROR, e);

    }
};

//Logout
exports.logout = async (req, res) => {
    try {
        let reqBody = req.body;
        let adminId = req.admin._id;

        // if (reqBody.deviceToken) {
        //     await UserToken.deleteOne({ userId: adminId, deviceToken: reqBody.deviceToken });
        // }
        return responseHelper.successapi(res, res.__('adminLogoutSuccessfully'), constants.META_STATUS.DATA, constants.WEB_STATUS_CODE.OK);
    } catch (e) {
        return responseHelper.error(res, res.__('somethingWentWrongPleaseTryAgain'), constants.WEB_STATUS_CODE.SERVER_ERROR, e);
    }
}