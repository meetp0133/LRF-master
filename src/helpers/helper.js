const ejs = require('ejs');
const path = require('path');
const fs = require('fs');
const constants = require('../../config/constants');
const {
    IMAGE_LINK,
    BASE_URL
} = require('../../config/key');
const Mailer = require('./mailer');
const bcrypt = require("bcrypt");

const toUpperCaseValidation = (str) => {
    if (str?.length) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    return '';
};

const validationMessageKey = (apiTag, error) => {
    let key = module.exports.toUpperCaseValidation(error.details[0].context.key);
    let type = error.details[0].type.split('.');
    type[1] = type[1] === 'empty' ? 'required' : type[1];
    type = module.exports.toUpperCaseValidation(type[1]);
    key = apiTag + key + type;
    return key;
};

const imageURL = (imageName, fileName) => {
    let urlData = '';

    urlData = `${IMAGE_LINK}${fileName}/${imageName}`;
    const pathOfImage = `public/uploads/${fileName}/${imageName}`;
    if (fs.existsSync(pathOfImage)) {
        return urlData
    } else {
        if (fileName === "user") urlData = `${IMAGE_LINK}${fileName}/${constants.DEFAULT_IMAGES.USER}`
    }
    return urlData
}

const deleteLocalFile = async (folderName, fileName) => {
    const filePath = path.join(
        __dirname,
        `../../public/uploads/${folderName}/${fileName}`
    );

    if (!(/default/ig).test(fileName)) {

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log('File deleted successfully', filePath);
        } else {
            console.log('File not found on this path', filePath);
        }
    } else {
        console.log('Image is default image')
    }

};

const createLocalFile = (filePath) => {
    try {
        if (!fs.existsSync(filePath)) {
            fs.closeSync(fs.openSync(filePath, 'w+'));
            return true;
        }
    } catch (err) {
        console.log('Error(createLocalFile): ', err);
        return false;
    }
}

const getFileName = async (file) => (
    (file) ? path.basename(file.key) : file.filename)

const getPageAndLimit = (page, limit) => {
    if (!page) page = constants.PAGE;
    if (!limit) limit = constants.LIMIT;
    let limitCount = limit * 1;
    let skipCount = (page - 1) * limitCount;
    return { limitCount, skipCount };
};

const facetHelper = (skip, limit) => {
    let obj = {
        $facet: {
            data: [
                {
                    $skip: Number(skip) < 0 ? 0 : Number(skip) || 0,
                },
                {
                    $limit: Number(limit) < 0 ? constants.LIMIT : Number(limit) || constants.LIMIT,
                },
            ],
            totalRecords: [
                {
                    $count: 'count',
                },
            ],
        },
    };
    return obj;
};

const searchHelper = (searchField, fields) => {
    let orArr = [];
    let search = [];
    searchField = searchField.replace(/[\*()+?[]/g, '');
    searchField = searchField.replace(']', '');
    search[0] = searchField.trim();

    fields.forEach((element1) => {
        search.forEach((element) => {
            orArr.push({ [element1]: { $regex: new RegExp(element, 'i') } });
        });
    });
    return { $match: { $or: orArr } };
};

const searchHelperForController = (searchField, fields) => {
    let orArr = [];
    let search = [];

    searchField = searchField.replace(/[\*()+?[]/g, '');
    searchField = searchField.replace(']', '');
    search[0] = searchField.trim();

    fields.forEach((element1) => {
        search.forEach((element) => {
            orArr.push({ [element1]: { $regex: new RegExp(element, 'i') } });
        });
    });
    return { $or: orArr };
};

const sortBy = (sortBy, sortKey) => {
    let obj = {};
    sortBy = sortBy ? sortBy : -1;
    sortBy = parseInt(sortBy);
    sortKey = sortKey ? sortKey : 'createdAt';
    obj[sortKey] = sortBy;
    return obj;
};

const makeFolderOnLocal = (fileUploadPath) => {
    if (!fs.existsSync(fileUploadPath)) {
        fs.mkdirSync(fileUploadPath, { recursive: true });
    }
};

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const deleteFilesIfAnyValidationError = async (files) => {
    try {
        if (Object.keys(files)) {
            let field = Object.keys(files);
            if (field.length > 0) {
                for (let element of field) {
                    let uploadedFiles = files[element];
                    if (uploadedFiles) {
                        uploadedFiles.forEach(x => {
                            let folderName = x.destination.split('/')[x.destination.split('/').length - 1];
                            deleteLocalFile(folderName, x.filename);
                        });
                    }
                }
            }

        }
    } catch (err) {
        console.log('Error(deleteFilesIfAnyValidationError)', err);
    }
};

const generateSlug = (string) => (string).trim().replace(/[^a-zA-Z0-9\s]/g, "").toLowerCase().replace(/\s/g, '-').replace(/\-\-+/g, '-');

const generateOTP = (ENV = 'local') => {
    let otp = ENV == 'local' ? '1234' : Math.floor(Math.random() * 9000) + 1000;
    otp = parseInt(otp);
    return otp;
};

const sendOtpEmail = async (req) => {
    let locals = {
        userName: req.fullName,
        appname: 'Aservey',
        otp: req.otp,
        email: req.email ? req.email : '',
        baseUrl: `${BASE_URL}/public/`
    };

    const emailBody = await ejs.renderFile(req.path, { locals: locals });
    //sending mail to user
    await Mailer.sendEmail(req.email, emailBody, req.subject);
};

const getSeederAdmins = async () => {
    let adminArr = [
        {
            firstName: 'Admin',
            lastName: 'Aservey',
            email: 'admin@yopmail.com',
            password: await bcrypt.hash('123456', 10),
        }
    ];
    return adminArr;
};

module.exports = {
    deleteFilesIfAnyValidationError,
    makeFolderOnLocal,
    sortBy,
    searchHelper,
    searchHelperForController,
    facetHelper,
    getPageAndLimit,
    getFileName,
    imageURL,
    validationMessageKey,
    toUpperCaseValidation,
    deleteLocalFile,
    createLocalFile,
    delay,
    generateSlug,
    generateOTP,
    sendOtpEmail,
    getSeederAdmins
};
