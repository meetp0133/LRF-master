const express = require('express');
const router = express.Router();

// -------------------------------- USER ROUTES ----------------------------

// User LRF route
const userRoutes = require('./api/v1/user.route');
router.use('/api/v1/user/', userRoutes);

// -------------------------------- ADMIN ROUTES ----------------------------

// Admin auth
const adminAuthRoutes = require('./admin/admin.route');
router.use('/admin', adminAuthRoutes);

// Admin CMS
const adminCMSRoutes = require('./admin/cms.route');
router.use('/admin/cms', adminCMSRoutes);

module.exports = router