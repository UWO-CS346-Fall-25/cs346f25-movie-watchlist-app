/**
 * Main Routes
 *
 * Contains routes for main pages:
 * - Home
 * - History
 * - Settings
 */

const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');

// Home page route
router.get('/', homeController.getHome);

// History page route
router.get('/history', homeController.getHistory);

// Settings page route
router.get('/settings', homeController.getSettings);

module.exports = router;
