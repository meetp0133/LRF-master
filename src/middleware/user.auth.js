const User = require("../models/user");
const Admin = require("../models/admin");
const jwt = require("jsonwebtoken");
const constants = require('../../config/constants');
const { JWT_AUTH_TOKEN_SECRET } = require('../../config/key');
const responseHelper = require('../helpers/response.helper');


//User Auth
exports.userAuth = async (req, res, next) => {
    try {
        if (!req.header('Authorization')) return responseHelper.error(res, res.__('tokenNotFound'), constants.WEB_STATUS_CODE.UNAUTHORIZED);

        const token = req.header('Authorization').replace('Bearer ', '');

        let decode = jwt.verify(token, JWT_AUTH_TOKEN_SECRET);
        if (!decode) return responseHelper.error(res, res.__('tokenExpired'), constants.WEB_STATUS_CODE.UNAUTHORIZED)

        const user = await User.findOne({ _id: decode?._id, status: constants.STATUS.ACTIVE, deletedAt: null });
        if (!user) return responseHelper.error(res, res.__('userNotFound'), constants.WEB_STATUS_CODE.FORBIDDEN);

        if (!user?.isVerified) return responseHelper.error(res, res.__('userAccountNotVerified'), constants.WEB_STATUS_CODE.UNAUTHORIZED)

        req.user = user;
        next();
    } catch (err) {
        console.log('Error(userAuth)', err);

        if (err.message == 'jwt malformed') {
            return res.status(constants.WEB_STATUS_CODE.UNAUTHORIZED).json({ message: res.__("unAuthorizedLogin") });
        }
        return responseHelper.error(res, res.__('tokenExpired'), constants.WEB_STATUS_CODE.UNAUTHORIZED);;
    }
};

//Admin Auth
module.exports.adminAuth = async (req, res, next) => {
    try {

        if (!req.header('Authorization')) return responseHelper.error(res, res.__('tokenNotFound'), constants.WEB_STATUS_CODE.UNAUTHORIZED);
        const token = req.header('Authorization').replace('Bearer ', '');

        let decode = jwt.verify(token, JWT_AUTH_TOKEN_SECRET);
        if (!decode) return responseHelper.error(res, res.__('tokenExpired'), constants.WEB_STATUS_CODE.UNAUTHORIZED);

        const admin = await Admin.findOne({ _id: decode._id });
        if (!admin) return responseHelper.error(res, res.__('adminNotFound'), constants.WEB_STATUS_CODE.FORBIDDEN);

        req.admin = admin;
        req.user = admin;
        await next();
    } catch (err) {
        console.log('Error(adminAuth)', err);
        if (err.name == 'MongooseError') {
            return responseHelper.error(res, res.__('databaseConnectionFailed'), constants.WEB_STATUS_CODE.SERVER_ERROR);
        }
        return responseHelper.error(res, res.__('tokenExpired'), constants.WEB_STATUS_CODE.UNAUTHORIZED);
    }
}