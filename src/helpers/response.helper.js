const constants = require('../../config/constants');
const helper = require("./helper");

// send success response
const successapi = async (res, message, status = constants.META_STATUS.DATA, statusCode = constants.WEB_STATUS_CODE.OK, data = null, extras = null) => {
	try {
		const response = {
			meta: {
				status,
				message,
			},
			data,
			statusCode,
		};
		if (extras) {
			Object.keys(extras).forEach((key) => {
				if ({}.hasOwnProperty.call(extras, key)) {
					response.meta[key] = extras[key];
				}
			});
		}
		return res.status(statusCode).send(response);
	} catch (err) {
		console.log('Error(successapi): ', err);
	}
};

// send error response
const error = async (res, message, statusCode = constants.WEB_STATUS_CODE.SERVER_ERROR, error = false) => {
	try {
		const response = {
			meta: {
				message,
			},
			statusCode
		};

		return res.status(statusCode).send(response);
	} catch (err) {
		console.log('Error(error)', err);
	}
};

//send validator response
const validatorFunction = async (req, res, next = null) => {
	try {
		if (req?.validationMessage) {
			await helper.deleteFilesIfAnyValidationError(req?.files ? req.files : {});
			return error(res, res.__(req.validationMessage), constants.WEB_STATUS_CODE.BAD_REQUEST);
		}
		next();
	} catch (err) {
		console.log('Error(validatorFunction)', err);
	}
};

//send validator response
const validatorFunctionForController = async (req, res) => {
	try {
		if (req?.validationMessage) return error(res, res.__(req.validationMessage), constants.WEB_STATUS_CODE.BAD_REQUEST);
	} catch (err) {
		console.log('Error(validatorFunctionForController)', err);
	}
};


module.exports = { successapi, error, validatorFunction, validatorFunctionForController };