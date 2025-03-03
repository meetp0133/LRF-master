const express = require('express');
const router = express.Router();
const cmsController = require('../../controller/admin/cms.controller');
const { adminAuth } = require('../../middleware/user.auth');
const cmsValidation = require('../../validations/cms.validation');
const responseHelper = require('../../helpers/response.helper')

router.get('/', (req, res) => res.send('Welcome to admin cms route'));

router.all('*', adminAuth);

router.post('/edit', cmsValidation.cmsEditValidation, responseHelper.validatorFunction, cmsController.editCms);
router.post('/view', cmsValidation.cmsViewValidation, responseHelper.validatorFunction, cmsController.viewCms);

module.exports = router;