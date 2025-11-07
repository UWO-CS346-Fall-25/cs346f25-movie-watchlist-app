/**
 * Movie Controller - Supabase Version with Authentication
 *
 * Handles movie-related operations for authenticated users:
 * - Adding movies
 * - Marking as watched
 * - Removing movies
 * - Getting movie lists
 */

const movieModel = require('../models/movieModel');

// Get user ID from session
function getUserId(req) {
  return req.session?.user?.id || null;
}

// Get all movies in watchlist
exports.getMovies = async (req, res) => {
  try {
    const userId = getUserId(req);
    const movies = await movieModel.getAllWatchlistMovies(userId);
    res.json({
      success: true,
      movies: movies,
    });
  } catch (error) {
    console.error('Error fetching movies:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch movies',
    });
  }
};

// Get all watched movies
exports.getWatchedMovies = async (req, res) => {
  try {
    const userId = getUserId(req);
    const movies = await movieModel.getAllWatchedMovies(userId);
    res.json({
      success: true,
      movies: movies,
    });
  } catch (error) {
    console.error('Error fetching watched movies:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch watched movies',
    });
  }
};

// Add a new movie
exports.addMovie = async (req, res) => {
  try {
    const { title, genre, desireScale } = req.body;
    const userId = getUserId(req);

    if (!title || !genre || !desireScale) {
      return res
        .status(400)
        .json({ success: false, error: 'Missing required fields' });
    }

    const newMovie = await movieModel.addMovie(
      { title, genre, desireScale },
      userId
    );

    if (!newMovie) {
      return res.status(500).json({
        success: false,
        error: 'Failed to add movie',
      });
    }

    res.json({ success: true, movie: newMovie });
  } catch (error) {
    console.error('Error adding movie:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add movie',
    });
  }
};

// Mark movie as watched
exports.markAsWatched = async (req, res) => {
  try {
    const movieId = req.params.id;
    const userId = getUserId(req);
    const watchedMovie = await movieModel.markAsWatched(movieId, userId);

    if (!watchedMovie) {
      return res.status(404).json({ success: false, error: 'Movie not found' });
    }

    res.json({ success: true, watchedMovie });
  } catch (error) {
    console.error('Error marking movie as watched:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark movie as watched',
    });
  }
};

// Remove movie
exports.removeMovie = async (req, res) => {
  try {
    const movieId = req.params.id;
    const userId = getUserId(req);
    const success = await movieModel.removeMovie(movieId, userId);

    if (!success) {
      return res.status(404).json({ success: false, error: 'Movie not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error removing movie:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove movie',
    });
  }
};

// Update movie review
exports.updateReview = async (req, res) => {
  try {
    const movieId = req.params.id;
    const { review, rating } = req.body;
    const userId = getUserId(req);

    const success = await movieModel.updateMovieReview(
      movieId,
      review,
      rating,
      userId
    );

    if (!success) {
      return res.status(404).json({ success: false, error: 'Movie not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating movie review:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update movie review',
    });
  }
};
