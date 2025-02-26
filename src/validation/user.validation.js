const Joi = require('joi');
const helper = require('../helpers/helper');

const registerUserValidation = (req, res, next) => {
    const schema = Joi.object({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        userName: Joi.string().required(),
        email: Joi.string().required().email(),
        password: Joi.string().required(),
        confirmPassword: Joi.string().required(),
        bio: Joi.string().optional().allow("")
    }).unknown(true);

    const { error } = schema.validate(req.query);
    if (error) req.validationMessage = helper.validationMessageKey('validation', error);
    next();

};

const loginUserValidation = (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string().required().email(),
        password: Joi.string().required()
    }).unknown(true);

    const { error } = schema.validate(req.body);
    if (error) req.validationMessage = helper.validationMessageKey('validation', error);
    next();
};

const forgotAndResendOtpValidation = (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string().required().email()
    }).unknown(true);

    const { error } = schema.validate(req.body);
    if (error) req.validationMessage = helper.validationMessageKey('validation', error);
    next();
};

const verifyUserValidation = (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string().required().email(),
        otp: Joi.required()
    }).unknown(true);

    const { error } = schema.validate(req.body);
    if (error) req.validationMessage = helper.validationMessageKey('validation', error);
    next();
};

const resetPasswordValidation = (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string().required().email(),
        otp: Joi.required(),
        password: Joi.string().required()
    }).unknown(true);

    const { error } = schema.validate(req.body);
    if (error) req.validationMessage = helper.validationMessageKey('validation', error);
    next();
};


const changePasswordValidation = (req, res, next) => {
    const schema = Joi.object({
        oldPassword: Joi.string().trim().required(),
        password: Joi.string().trim().required(),
        confirmPassword: Joi.string().trim().required()
    }).unknown(true);

    const { error } = schema.validate(req.body);
    if (error) req.validationMessage = helper.validationMessageKey('validation', error);

    next();
};

module.exports = { registerUserValidation, loginUserValidation, forgotAndResendOtpValidation, verifyUserValidation, resetPasswordValidation, changePasswordValidation }
