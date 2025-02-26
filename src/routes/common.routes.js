const express = require('express');
const router = express.Router();

// -------------------------------- USER ROUTES ----------------------------

// User LRF route
const userRoutes = require('./api/v1/user.route');
router.use('/api/v1/user/', userRoutes);
