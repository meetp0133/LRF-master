const express = require('express');
const router = express.Router();
const cmsController = require('../controllers/cms.controller');
const { adminAuth } = require('../middleware/verifyToken');
const cmsValidation = require('../validations/admin/cms.validation');
const { responseHelper } = require('../../common/index')

router.get('/', (req, res) => res.send('Welcome to admin cms route'));

router.all('*', adminAuth);

router.post('/edit', cmsValidation.cmsEditValidation, responseHelper.validatorFunction, cmsController.editCms);
router.post('/view', cmsValidation.cmsViewValidation, responseHelper.validatorFunction, cmsController.viewCms);

module.exports = router;