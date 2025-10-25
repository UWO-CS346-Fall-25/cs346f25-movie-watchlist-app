/**
 * Home Controller
 *
 * Contains methods for handling:
 * - Home page with movie data
 * - History page with watched movies
 * - Settings page
 */

const movieModel = require('../models/movieModel');

// Home page controller
exports.getHome = (req, res) => {
  const movies = movieModel.getAllWatchlistMovies();

  res.render('index', {
    title: 'Home',
    user: req.user || null,
    csrfToken: req.csrfToken ? req.csrfToken() : '',
    movies: movies,
    totalMovies: movies.length,
  });
};

// History page controller
exports.getHistory = (req, res) => {
  const watchedMovies = movieModel.getAllWatchedMovies();

  res.render('history', {
    title: 'History',
    user: req.user || null,
    csrfToken: req.csrfToken ? req.csrfToken() : '',
    watchedMovies: watchedMovies,
    totalWatched: watchedMovies.length,
  });
};

// Settings page controller
exports.getSettings = (req, res) => {
  res.render('settings', {
    title: 'Settings',
    user: req.user || null,
    csrfToken: req.csrfToken ? req.csrfToken() : '',
    currentTheme: 'light',
  });
};
