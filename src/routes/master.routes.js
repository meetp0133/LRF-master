const express = require('express');
const router = express.Router();
const masterController = require('../controller/master.controller');

router.post('/generate', masterController.masterLRF);

module.exports = router;