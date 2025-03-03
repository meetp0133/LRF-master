const Joi = require('joi');
const { helper } = require('../../../common/index');


exports.cmsViewValidation = (req, res, next) => {
    const schema = Joi.object({
        slug: Joi.string().required(),
    }).unknown(true);

    const { error } = schema.validate(req.body);
    if (error) {
        let validationMessage = helper.validationMessageKey('validation', error);
        req.validationMessage = validationMessage;
    }
    next();
};

exports.cmsEditValidation = (req, res, next) => {
    const schema = Joi.object({
        slug: Joi.string().required(),
        description: Joi.string().required(),
    }).unknown(true);

    const { error } = schema.validate(req.body);
    if (error) {
        let validationMessage = helper.validationMessageKey('validation', error);
        req.validationMessage = validationMessage;
    }
    next();
};