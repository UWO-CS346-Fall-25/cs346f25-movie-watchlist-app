/**
 * API Routes
 *
 * Contains API endpoints for AJAX operations:
 * - GET, POST, PUT, DELETE for movies
 */

const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');

// Get all movies in watchlist
router.get('/movies', movieController.getMovies);

// Get all watched movies
router.get('/watched', movieController.getWatchedMovies);

// Add a new movie
router.post('/movies', movieController.addMovie);

// Mark movie as watched
router.put('/movies/:id/watched', movieController.markAsWatched);

// Remove movie (from watchlist)
router.delete('/movies/:id', movieController.removeMovie);

// Remove watched movie
router.delete('/watched/:id', movieController.removeWatchedMovie);

// Update movie review
router.put('/watched/:id/review', movieController.updateReview);

module.exports = router;
