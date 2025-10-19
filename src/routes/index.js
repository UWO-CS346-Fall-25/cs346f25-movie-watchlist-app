/**
 * Main Routes
 *
 * Contains routes for:
 * - Home page
 * - History page
 * - Settings page
 */

const express = require('express');
const router = express.Router();

// Import controllers
const homeController = require('../controllers/homeController');

// Home page route
router.get('/', (req, res) => {
  res.render('index', {
    title: 'Home',
    user: req.user,
    csrfToken: req.csrfToken(),
  });
});

// History page route
router.get('/history', (req, res) => {
  res.render('history', {
    title: 'History',
    user: req.user,
    csrfToken: req.csrfToken(),
  });
});

// Settings page route
router.get('/settings', (req, res) => {
  res.render('settings', {
    title: 'Settings',
    user: req.user,
    csrfToken: req.csrfToken(),
  });
});

module.exports = router;
module.exports = router;
