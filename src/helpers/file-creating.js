const { constants } = require("buffer");
const fs = require("fs");
const path = require("path");
module.exports = {
    // Helper to create directories
    createDir: (dirPath) => {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    },
    // Helper to write files
    writeFile: (filePath, content) => {
        try {
            fs.writeFileSync(filePath, content);
            console.log(`---------->  File written successfully at: ${filePath}`);
        } catch (error) {
            console.error(`Failed to write file at: ${filePath}`);
            console.error("----------->", error.message);
        }
    },
    keyJson: () => {
        return `require('dotenv').config();
         module.exports = {
            DB_AUTH_URL: process.env.DB_AUTH_URL,
            PORT: process.env.PORT,
            JWT_AUTH_TOKEN_SECRET: process.env.JWT_AUTH_TOKEN_SECRET,
            JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
            IMAGE_LINK: process.env.IMAGE_LINK,
            SENDER_EMAIL: process.env.SENDER_EMAIL,
            SENDER_PASSWORD: process.env.SENDER_PASSWORD,
            EMAIL_SERVICE: process.env.EMAIL_SERVICE,
            ENVIRONMENT: process.env.ENVIRONMENT,
            PAGINATION_LIMIT : 10,
            IS_SSL : process.env.IS_SSL
        }`
    },
    envJson: (projectName) => {
        return `
            ENVIRONMENT = "local"

            IS_SSL = false
            DB_AUTH_URL = mongodb://localhost:27017/${projectName}
            PORT = 3000
            JWT_AUTH_TOKEN_SECRET = M5gqAbXVzErKf4XMf3BZcE0UTx0FhLCTPF0vXYKpTUHUvq5QiX46GA9A6EEQJ3LPYDPXyCTvrVDyqWGmWBdTigEBUvK7TG6teHX2
            JWT_EXPIRES_IN = 365d
            IMAGE_LINK = 'http://localhost:3003/public/uploads/'
            SENDER_EMAIL = SENDER_EMAIL
            SENDER_PASSWORD = SENDER_PASSWORD
            EMAIL_SERVICE = 'gmail'
        `
    },
    dbJson: () => {
        return `const mongoose = require('mongoose');
                const { DB_AUTH_URL } = require('../../config/key');

                mongoose.connect(DB_AUTH_URL, {
                    maxPoolSize: 10
                });

                mongoose.connection.on('error', (err) => {
                    console.log('Database connection err', err);
                    throw err;
                });

                mongoose.connection.on('connected', () => {
                    console.log('Connected to database');
                    mongoose.syncIndexes().then(() => console.log('Indexes synchronized successfully')).catch(err => console.log('err', err));
                });

                mongoose.connection.on('connecting', function () {
                    console.log('Trying to establish a connection to mongo');
                });

                mongoose.connection.on('error', function (err) {
                    console.log('Connection to mongo failed ' + err);
                });

                mongoose.connection.on('disconnected', function () {
                    console.log('Mongo connection closed');

                    mongoose.connect(DB_AUTH_URL, {
                        maxPoolSize: 10
                    });
                });

                module.exports = { mongoose }

        `
    },
    constantsJson: () => {
        return `
            module.exports = {

                WEB_STATUS_CODE: {
                    OK: 200,
                    BAD_REQUEST: 400,
                    UNAUTHORIZED: 401,
                    FORBIDDEN: 403,
                    NOT_FOUND: 404,
                    SERVER_ERROR: 500,
                    MAINTENANCE: 503
                },

                META_STATUS: {
                    DATA: 1,                            // When there is success response from api
                    NO_DATA: 0                          // When there is no data found in api  // Not when there is no response data in api response
                },

                STATUS: {
                    ACTIVE: 1,
                    INACTIVE: 2,
                    DELETED: 3
                },

                OTP: {
                    EXPIRES_IN: 5                       // 5 min OTP expiration time
                },

                PAGE: 1,
                LIMIT: 10
                }`
    },
    i18nJson: () => {
        return `const i18n = require('i18n');
                i18n.configure({
                    locales: ['en'],

                    directory: __dirname + '/locales',

                    defaultLocale: 'en',

                    cookie: 'lang',
                });

                module.exports = function (req, res, next) {

                    i18n.init(req, res);

                    return next();
                };
                `
    },
    copyHelperFunction: (projectName, fileName, sourcePath, outputPath) => {
        let source
        if (sourcePath) {
            source = path.join(__dirname, sourcePath, fileName);
        } else {
            source = path.join(__dirname, fileName);
        }
        const destination = path.join(__dirname, `../../../${projectName}`, outputPath, fileName);

        try {
            fs.copyFileSync(source, destination);
            console.log("File copied successfully!");
        } catch (err) {
            console.error("Error copying file:", err.message);
        }
    },
    generateSchemaFile: (projectPath, model) => {

        const staticFields = `
            status: {
                type: Number,
                default: constants.STATUS.ACTIVE,
                enum : [...Object.values(constants.STATUS)]
            },
            firstName: {
                type: String,
                index: true
            },
            lastName: {
                type: String,
                index: true
            },
            email: {
                type: String,
                index: true,
                lowercase: true
            },
            password: {
                type: String
            },
            isVerified: {
                type: Boolean,
                default: false
            },
            otp: {
                type: Number
            },
            otpExpiresAt: {
                type: Number
            },
            createdAt: {
                type: Number
            },
            updatedAt: {
                type: Number
            },
        `;

        const schemaMethods = `
        // Checking if password is valid
        ${model.name}Schema.methods.validPassword = function (password) {
            return bcrypt.compareSync(password, this.password);
        };
    
        // Output data to JSON
        ${model.name}Schema.methods.toJSON = function () {
            let user = this;
            let userObject = user.toObject();
            return userObject;
        };
    
        // Generate auth token
        ${model.name}Schema.methods.generateAuthToken = async function () {
            let user = this;
    
            let token = jwt.sign({
                _id: user._id.toString(),
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                status: user.status,
            }, JWT_AUTH_TOKEN_SECRET, {
                expiresIn: JWT_EXPIRES_IN
            });
    
            return token;
        };
    
        ${model.name}Schema.pre('save', async function (next) {
            if (!this?.createdAt) {
                this.createdAt = dateFormat.setCurrentTimestamp();
            }
            this.updatedAt = dateFormat.setCurrentTimestamp();
            next();
        });
        `;
        // Generate dynamic fields as nested objects
        const dynamicFields = Object.entries(model.schema)
            .map(([key, value]) => {
                // Ensure the value is properly formatted as a nested object
                return `
        ${key}: {
            type: ${value.type},
            ${value.required ? "\nrequired: true," : ""}
            ${value.default ? `\ndefault: ${JSON.stringify(value.default)},` : ""}
        },
        `;
            })
            .join("\n");
        const schemaContent = `
            const mongoose = require('mongoose');
            const bcrypt = require('bcryptjs');
            const jwt = require('jsonwebtoken');
            const dateFormat = require('../helpers/dateFormat.helper');
            const constants = require('../../config/constants');
    
            const ${model.name}Schema = new mongoose.Schema({
                // Dynamic fields
                ${dynamicFields}
    
                // Static fields
                ${staticFields}
            });
    
            ${schemaMethods}
    
            module.exports = mongoose.model('${model.name}', ${model.name}Schema);
        `;

        module.exports.writeFile(
            path.join(projectPath, `${model.name}.js`),
            schemaContent
        );
    }

}