
            const mongoose = require('mongoose');
            const bcrypt = require('bcryptjs');
            const jwt = require('jsonwebtoken');
            const dateFormat = require('../helpers/dateFormat.helper');
            const constants = require('../../config/constants');
    
            const UserSchema = new mongoose.Schema({
                // Dynamic fields
                
    
                // Static fields
                
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
        
            });
    
            
        // Checking if password is valid
        UserSchema.methods.validPassword = function (password) {
            return bcrypt.compareSync(password, this.password);
        };
    
        // Output data to JSON
        UserSchema.methods.toJSON = function () {
            let user = this;
            let userObject = user.toObject();
            return userObject;
        };
    
        // Generate auth token
        UserSchema.methods.generateAuthToken = async function () {
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
    
        UserSchema.pre('save', async function (next) {
            if (!this?.createdAt) {
                this.createdAt = dateFormat.setCurrentTimestamp();
            }
            this.updatedAt = dateFormat.setCurrentTimestamp();
            next();
        });
        
    
            module.exports = mongoose.model('User', UserSchema);
        