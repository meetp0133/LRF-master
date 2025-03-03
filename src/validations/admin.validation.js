const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const helper = require("../helpers/helper")

module.exports.loginValidation = async (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string().required().email(),
        password: Joi.string().required()
    }).unknown(true);
    const { error } = schema.validate(req.body);
    if (error) {
        let validationMessage = helper.validationMessageKey('validation', error);
        req.validationMessage = validationMessage;
    }
    next();
};

module.exports.forgotPasswordValidation = async (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string().required().email(),
    }).unknown(true);
    const { error } = schema.validate(req.body);
    if (error) {
        let validationMessage = helper.validationMessageKey('validation', error);
        req.validationMessage = validationMessage;
    }
    next();
};

module.exports.resetPasswordValidation = async (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string().required().email(),
        otp: Joi.number().required(),
        password: Joi.string().required()
    }).unknown(true);
    const { error } = schema.validate(req.body);
    if (error) {
        let validationMessage = helper.validationMessageKey('validation', error);
        req.validationMessage = validationMessage;
    }
    next();
};

module.exports.changePasswordValidation = async (req, res, next) => {
    const schema = Joi.object({
        oldPassword: Joi.string().required(),
        password: Joi.string().required()
    }).unknown(true);
    const { error } = schema.validate(req.body);
    if (error) {
        let validationMessage = helper.validationMessageKey('validation', error);
        req.validationMessage = validationMessage;
    }
    next();
};

module.exports.editProfileValidation = async (req, res, next) => {
    const schema = Joi.object({
        firstName: Joi.string(),
        lastName: Joi.string(),
        mobileNumber: Joi.string().pattern(/^[0-9]+$/)
    }).unknown(true);
    const { error } = schema.validate(req.body);
    if (error) {
        let validationMessage = helper.validationMessageKey('validation', error);
        req.validationMessage = validationMessage;
    }
    next();
}
