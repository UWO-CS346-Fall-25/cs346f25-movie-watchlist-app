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
const loggingService = require('../services/loggingService');

// Get user ID from session
function getUserId(req) {
  return req.session?.user?.id || null;
}

/**
 * Retrieves all movies in the authenticated user's watchlist.
 *
 * @param {Object} req - Express request object
 * @param {string} req.session.user.id - The UUID of the authenticated user
 * @param {Object} res - Express response object
 * @returns {Promise<void>} Sends JSON response containing the list of movies
 */
exports.getMovies = async (req, res) => {
  try {
    const userId = getUserId(req);
    const movies = await movieModel.getAllWatchlistMovies(userId);

    loggingService.logDatabaseOperation('Get watchlist movies', {
      userId,
      movieCount: movies.length,
      operation: 'READ',
    });

    res.json({
      success: true,
      movies: movies,
    });
  } catch (error) {
    loggingService.error('Error fetching movies', {
      error: error.message,
      stack: error.stack,
      userId: getUserId(req),
    });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch movies',
    });
  }
};

/**
 * Retrieves all movies marked as watched by the user.
 *
 * @param {Object} req - Express request object
 * @param {string} req.session.user.id - The UUID of the authenticated user
 * @param {Object} res - Express response object
 * @returns {Promise<void>} Sends JSON response containing the list of watched movies
 */
exports.getWatchedMovies = async (req, res) => {
  try {
    const userId = getUserId(req);
    const movies = await movieModel.getAllWatchedMovies(userId);

    loggingService.logDatabaseOperation('Get watched movies', {
      userId,
      movieCount: movies.length,
      operation: 'READ',
    });

    res.json({
      success: true,
      movies: movies,
    });
  } catch (error) {
    loggingService.error('Error fetching watched movies', {
      error: error.message,
      stack: error.stack,
      userId: getUserId(req),
    });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch watched movies',
    });
  }
};

/**
 * Validates input and creates a new movie record in the database.
 *
 * @param {Object} req - Express request object
 * @param {Object} req.body - The movie data (title, genre, desireScale, tmdbId, etc.)
 * @param {Object} res - Express response object
 * @returns {Promise<void>} Sends JSON response with the created movie object or error
 */
exports.addMovie = async (req, res) => {
  const startTime = Date.now();

  try {
    const {
      title,
      genre,
      desireScale,
      tmdbId,
      posterPath,
      overview,
      releaseDate,
      voteAverage,
    } = req.body;
    const userId = getUserId(req);

    loggingService.logApiCall('/api/movies', 'POST', userId);

    if (!title || !genre || !desireScale) {
      loggingService.logApiError(
        '/api/movies',
        'POST',
        new Error('Missing required fields'),
        userId
      );
      return res
        .status(400)
        .json({ success: false, error: 'Missing required fields' });
    }

    if (!userId) {
      loggingService.logSecurityEvent('Unauthenticated API access', null, {
        endpoint: '/api/movies',
        method: 'POST',
      });
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }

    const movieData = {
      title,
      genre,
      desireScale,
    };

    // Add optional TMDB fields if provided
    if (tmdbId) movieData.tmdbId = tmdbId;
    if (posterPath) movieData.posterPath = posterPath;
    if (overview) movieData.overview = overview;
    if (releaseDate) movieData.releaseDate = releaseDate;
    if (voteAverage) movieData.voteAverage = voteAverage;

    const newMovie = await movieModel.addMovie(movieData, userId);

    if (!newMovie) {
      loggingService.logDatabaseError(
        'INSERT',
        'movies',
        new Error('Movie creation failed'),
        userId
      );
      return res.status(500).json({
        success: false,
        error: 'Failed to add movie',
      });
    }

    // Log successful movie addition
    loggingService.logMovieAction('ADD_MOVIE', newMovie, userId);
    loggingService.logDatabaseOperation('INSERT', 'movies', userId, {
      movieId: newMovie.id,
      title: newMovie.title,
    });

    const duration = Date.now() - startTime;
    loggingService.logPerformance('addMovie', duration, {
      userId,
      movieTitle: title,
    });

    res.json({ success: true, movie: newMovie });
  } catch (error) {
    loggingService.logApiError('/api/movies', 'POST', error, getUserId(req));
    res.status(500).json({
      success: false,
      error: 'Failed to add movie',
    });
  }
};

/**
 * Updates a specific movie's status to 'watched' and optionally adds a review.
 *
 * @param {Object} req - Express request object
 * @param {string} req.params.id - The ID of the movie to update
 * @param {number} [req.body.rating] - Optional rating (1-5)
 * @param {string} [req.body.review] - Optional text review
 * @param {Object} res - Express response object
 * @returns {Promise<void>} Sends JSON response with the updated movie
 */
exports.markAsWatched = async (req, res) => {
  try {
    const movieId = req.params.id;
    const userId = getUserId(req);
    const { rating, review } = req.body;

    const watchedMovie = await movieModel.markAsWatched(movieId, userId);

    if (!watchedMovie) {
      return res.status(404).json({ success: false, error: 'Movie not found' });
    }

    // If rating or review was provided, update the movie
    if (rating || review) {
      const updateSuccess = await movieModel.updateMovieReview(
        movieId,
        review,
        rating,
        userId
      );
      if (!updateSuccess) {
        loggingService.warn(
          'Failed to update review/rating, but movie was marked as watched',
          {
            movieId,
            userId,
            rating,
            review: review ? 'provided' : 'not provided',
          }
        );
      }
    }

    loggingService.logDatabaseOperation('Movie marked as watched', {
      userId,
      movieId,
      operation: 'UPDATE',
      hasRating: !!rating,
      hasReview: !!review,
    });

    res.json({ success: true, watchedMovie });
  } catch (error) {
    loggingService.error('Error marking movie as watched', {
      error: error.message,
      stack: error.stack,
      movieId: req.params.id,
      userId: getUserId(req),
    });
    res.status(500).json({
      success: false,
      error: 'Failed to mark movie as watched',
    });
  }
};

/**
 * Removes a movie from the database.
 *
 * @param {Object} req - Express request object
 * @param {string} req.params.id - The ID of the movie to remove
 * @param {Object} res - Express response object
 * @returns {Promise<void>} Sends success JSON or 404 error
 */
exports.removeMovie = async (req, res) => {
  try {
    const movieId = req.params.id;
    const userId = getUserId(req);
    const success = await movieModel.removeMovie(movieId, userId);

    if (!success) {
      return res.status(404).json({ success: false, error: 'Movie not found' });
    }

    loggingService.logDatabaseOperation('Movie removed from watchlist', {
      userId,
      movieId,
      operation: 'DELETE',
    });

    res.json({ success: true });
  } catch (error) {
    loggingService.error('Error removing movie', {
      error: error.message,
      stack: error.stack,
      movieId: req.params.id,
      userId: getUserId(req),
    });
    res.status(500).json({
      success: false,
      error: 'Failed to remove movie',
    });
  }
};

/**
 * Removes a watched movie from the database.
 *
 * @param {Object} req - Express request object
 * @param {string} req.params.id - The ID of the movie to remove
 * @param {Object} res - Express response object
 * @returns {Promise<void>} Sends success JSON or 404 error
 */
exports.removeWatchedMovie = async (req, res) => {
  try {
    const movieId = req.params.id;
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }

    const success = await movieModel.removeMovie(movieId, userId);

    if (!success) {
      return res.status(404).json({ success: false, error: 'Movie not found' });
    }

    loggingService.logDatabaseOperation('Watched movie removed', {
      userId,
      movieId,
      operation: 'DELETE',
    });

    res.json({ success: true });
  } catch (error) {
    loggingService.error('Error removing watched movie', {
      error: error.message,
      stack: error.stack,
      movieId: req.params.id,
      userId: getUserId(req),
    });
    res.status(500).json({
      success: false,
      error: 'Failed to remove watched movie',
    });
  }
};

/**
 * Updates the review and rating for a specific movie.
 *
 * @param {Object} req - Express request object
 * @param {string} req.params.id - The ID of the movie to update
 * @param {string} req.body.review - The new review text
 * @param {number} req.body.rating - The new rating
 * @param {Object} res - Express response object
 * @returns {Promise<void>} Sends success JSON or 404/500 error
 */
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

    loggingService.logDatabaseOperation('Movie review updated', {
      userId,
      movieId,
      operation: 'UPDATE',
      hasReview: !!review,
      hasRating: !!rating,
    });

    res.json({ success: true });
  } catch (error) {
    loggingService.error('Error updating movie review', {
      error: error.message,
      stack: error.stack,
      movieId: req.params.id,
      userId: getUserId(req),
      review: req.body?.review ? 'provided' : 'not provided',
      rating: req.body?.rating,
    });
    res.status(500).json({
      success: false,
      error: 'Failed to update movie review',
    });
  }
};
