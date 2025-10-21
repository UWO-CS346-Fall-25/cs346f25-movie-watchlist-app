/**
 * Movie Controller
 *
 * Handles movie-related operations:
 * - Adding movies
 * - Marking as watched
 * - Removing movies
 * - Getting movie lists
 */

const movieModel = require('../models/movieModel');

// Get all movies in watchlist
exports.getMovies = (req, res) => {
  res.json({
    success: true,
    movies: movieModel.getAllWatchlistMovies(),
  });
};

// Get all watched movies
exports.getWatchedMovies = (req, res) => {
  res.json({
    success: true,
    movies: movieModel.getAllWatchedMovies(),
  });
};

// Add a new movie
exports.addMovie = (req, res) => {
  const { title, genre, desireScale } = req.body;

  if (!title || !genre || !desireScale) {
    return res
      .status(400)
      .json({ success: false, error: 'Missing required fields' });
  }

  const newMovie = movieModel.addMovie({ title, genre, desireScale });
  res.json({ success: true, movie: newMovie });
};

// Mark movie as watched
exports.markAsWatched = (req, res) => {
  const movieId = req.params.id;
  const watchedMovie = movieModel.markAsWatched(movieId);

  if (!watchedMovie) {
    return res.status(404).json({ success: false, error: 'Movie not found' });
  }

  res.json({ success: true, watchedMovie });
};

// Remove movie
exports.removeMovie = (req, res) => {
  const movieId = req.params.id;
  const success = movieModel.removeMovie(movieId);

  if (!success) {
    return res.status(404).json({ success: false, error: 'Movie not found' });
  }

  res.json({ success: true });
};

// Update movie review
exports.updateReview = (req, res) => {
  const movieId = req.params.id;
  const { review, rating } = req.body;

  const success = movieModel.updateMovieReview(movieId, review, rating);

  if (!success) {
    return res.status(404).json({ success: false, error: 'Movie not found' });
  }

  res.json({ success: true });
};
