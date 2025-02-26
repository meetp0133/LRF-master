const multer = require('multer');
const path = require('path');
const constants = require('../../config/constants');
const { makeFolderOnLocal } = require('../helpers/helper');

let imageFieldList = ['profileImage']
//middleware for adding image
const storage = multer.diskStorage({
    destination: function (req, file, cb) {

        switch (file.fieldname) {

            case 'profileImage':
                makeFolderOnLocal(constants.USER_PROFILE_IMAGE_UPLOAD_PATH_LOCAL);
                cb(null, path.join(constants.USER_PROFILE_IMAGE_UPLOAD_PATH_LOCAL));
                break;

            default:
                console.log(`fieldName not found: ${file}`);
                break;
        }
    },
    filename: function (req, file, cb) {
        cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
});

module.exports.upload = multer({ storage: storage });


module.exports.uploadImage = multer({
    storage: storage,
    limits: {
        fileSize: 1000 * 1024 * 1024,
    },
    fileFilter(req, file, cb) {
        if (imageFieldList.includes(file.fieldname)) {
            if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|webp|WEBP)$/i)) {
                req.files.isFileTypeError = true;
                return cb('validImage', false);
            }
            cb(undefined, true);
        }
    },
}).fields([
    { name: 'profileImage', maxCount: 1 }
]);

module.exports.validMulterUploadMiddleware = (multerUploadFunction) => {

    return (req, res, next) =>
        multerUploadFunction(req, res, (err) => {
            // handle Multer error
            if (err && err.name && err.name === 'MulterError') {

                if (err.message == 'Unexpected field') {
                    return res.status(constants.WEB_STATUS_CODE.SERVER_ERROR).json({ message: res.__('unexpectedFileField') });
                }
                if (err.code == 'LIMIT_UNEXPECTED_FILE') {
                    return res.status(constants.WEB_STATUS_CODE.SERVER_ERROR).json({ message: res.__('fileLimitExceeded') });
                }
                if (err.code == 'LIMIT_FILE_SIZE') {
                    return res.status(constants.WEB_STATUS_CODE.SERVER_ERROR).json({ message: res.__('fileSizeUploadLimitExceeded') });
                }

                return res.status(constants.WEB_STATUS_CODE.SERVER_ERROR).json({ message: res.__('somethingWentWrongPleaseTryAgain') });

            }
            if (err) {
                // handle other errors
                return res.status(constants.WEB_STATUS_CODE.BAD_REQUEST).json({ message: res.__(err) });

            }
            next();
        });
};