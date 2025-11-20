/**
 * Main Routes
 *
 * Contains routes for main pages:
 * - Home
 * - History
 * - Settings
 * - Search (Movie API)
 */

const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');

// Home page route
router.get('/', homeController.getHome);

// Search page route (for TMDB API integration)
router.get('/search', (req, res) => {
  res.render('search', {
    title: 'Search Movies',
    user: req.session.user || null,
  });
});

// History page route
router.get('/history', homeController.getHistory);

// Settings page route
router.get('/settings', homeController.getSettings);

module.exports = router;
