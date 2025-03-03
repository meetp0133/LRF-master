const cmsModel = require('../../model/cms.model');
const { constants, responseHelper } = require('../../../common/index');
const { transformViewCms } = require('../../transformer/cms.transformer');

exports.editCms = async (req, res) => {
    try {
        const reqBody = req.body;

        let message = 'cmsUpdated';
        let response;

        const findCms = await cmsModel.findOne({ slug: reqBody.slug, status: constants.STATUS.ACTIVE });
        if (!findCms) return responseHelper.successapi(res, res.__('cmsNotFound'), constants.META_STATUS.NO_DATA, constants.WEB_STATUS_CODE.OK);

        findCms.title = reqBody?.title ? reqBody.title : findCms.title;
        findCms.description = reqBody?.description ? reqBody.description : findCms.description;

        await findCms.save();

        if (reqBody.slug === 'privacy-policy') message = 'privacyPolicyUpdated';
        if (reqBody.slug === 'terms-and-conditions') message = 'termsAndConditionsUpdated';
        if (reqBody.slug === 'about-us') message = 'aboutUsUpdated';

        response = transformViewCms(findCms);

        return responseHelper.successapi(res, res.__(message), constants.META_STATUS.DATA, constants.WEB_STATUS_CODE.OK, response);
    } catch (err) {
        console.log('Error(editCms)', err);
        return responseHelper.error(res, res.__('somethingWentWrongPleaseTryAgain'), constants.WEB_STATUS_CODE.SERVER_ERROR, err);
    }
};

exports.viewCms = async (req, res) => {
    try {
        const reqBody = req.body;
        let message = 'cmsFound';
        let response;
        const findCms = await cmsModel.findOne({ slug: reqBody.slug, status: constants.STATUS.ACTIVE });
        if (!findCms) return responseHelper.successapi(res, res.__('cmsNotFound'), constants.META_STATUS.NO_DATA, constants.WEB_STATUS_CODE.OK);

        if (reqBody.slug === 'privacy-policy') message = 'privacyPolicyFounded';
        if (reqBody.slug === 'terms-and-conditions') message = 'termsAndConditionsFounded';
        if (reqBody.slug === 'about-us') message = 'aboutUsFounded';

        response = transformViewCms(findCms);

        return responseHelper.successapi(res, res.__(message), constants.META_STATUS.DATA, constants.WEB_STATUS_CODE.OK, response);

    } catch (err) {
        console.log('Error(viewCms)', err);
        return responseHelper.error(res, res.__('somethingWentWrongPleaseTryAgain'), constants.WEB_STATUS_CODE.SERVER_ERROR, err);
    }
}