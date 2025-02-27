const UserModel = require("../models/user");
const jwt = require("jsonwebtoken");
const constants = require('../../config/constants');
const { JWT_AUTH_TOKEN_SECRET } = require('../../config/key');


//User Auth
exports.userAuth = async (req, res, next) => {
    try {
        if (!req.header('Authorization')) return res.status(constants.WEB_STATUS_CODE.UNAUTHORIZED).json({ message: res.__("tokenNotFound") });

        const token = req.header('Authorization').replace('Bearer ', '');

        let decode = jwt.verify(token, JWT_AUTH_TOKEN_SECRET);
        if (!decode) return res.status(constants.WEB_STATUS_CODE.UNAUTHORIZED).json({ message: res.__("unAuthorizedLogin") });

        const user = await UserModel.findOne({ _id: decode?._id, status: constants.STATUS.ACTIVE, deletedAt: null });
        if (!user) return res.status(constants.WEB_STATUS_CODE.UNAUTHORIZED).json({ message: res.__("userNotFound") });

        if (!user?.isVerified) return res.status(constants.WEB_STATUS_CODE.UNAUTHORIZED).json({ message: res.__("userAccountNotVerified") });

        req.user = user;
        next();
    } catch (err) {
        console.log('Error(userAuth)', err);

        if (err.message == 'jwt malformed') {
            return res.status(constants.WEB_STATUS_CODE.UNAUTHORIZED).json({ message: res.__("unAuthorizedLogin") });
        }
        return res.status(constants.WEB_STATUS_CODE.UNAUTHORIZED).json({ message: res.__("tokenExpired") });
    }
};
