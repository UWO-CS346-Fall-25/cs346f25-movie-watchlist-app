/**
 * Home Controller - Supabase Version with Authentication
 *
 * Contains methods for handling:
 * - Home page with movie data
 * - History page with watched movies
 * - Settings page
 */

const movieModel = require('../models/movieModel');

// Get user from session
function getSessionUser(req) {
  return req.session?.user || null;
}

// Get user ID from session
function getUserId(req) {
  return req.session?.user?.id || null;
}

// Home page controller
exports.getHome = async (req, res) => {
  try {
    const user = getSessionUser(req);
    const userId = getUserId(req);

    // If user is not logged in, redirect to login
    if (!user) {
      return res.redirect('/users/login');
    }

    const movies = await movieModel.getAllWatchlistMovies(userId);

    res.render('index', {
      title: 'Home',
      user: user,
      csrfToken: req.csrfToken ? req.csrfToken() : '',
      movies: movies,
      totalMovies: movies.length,
    });
  } catch (error) {
    console.error('Error loading home page:', error);
    res.render('index', {
      title: 'Home',
      user: getSessionUser(req),
      csrfToken: req.csrfToken ? req.csrfToken() : '',
      movies: [],
      totalMovies: 0,
    });
  }
};

// History page controller
exports.getHistory = async (req, res) => {
  try {
    const user = getSessionUser(req);
    const userId = getUserId(req);

    // If user is not logged in, redirect to login
    if (!user) {
      return res.redirect('/users/login');
    }

    const watchedMovies = await movieModel.getAllWatchedMovies(userId);

    res.render('history', {
      title: 'History',
      user: user,
      csrfToken: req.csrfToken ? req.csrfToken() : '',
      watchedMovies: watchedMovies,
      totalWatched: watchedMovies.length,
    });
  } catch (error) {
    console.error('Error loading history page:', error);
    res.render('history', {
      title: 'History',
      user: getSessionUser(req),
      csrfToken: req.csrfToken ? req.csrfToken() : '',
      watchedMovies: [],
      totalWatched: 0,
    });
  }
};

// Settings page controller
exports.getSettings = (req, res) => {
  const user = getSessionUser(req);

  // If user is not logged in, redirect to login
  if (!user) {
    return res.redirect('/users/login');
  }

  res.render('settings', {
    title: 'Settings',
    user: user,
    csrfToken: req.csrfToken ? req.csrfToken() : '',
    currentTheme: 'light',
  });
};
