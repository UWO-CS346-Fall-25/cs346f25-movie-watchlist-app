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

/**
 * Renders the Home page (Watchlist).
 * Checks for authentication and handles the one-time welcome message.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>} Renders 'index' view with movies or redirects to login
 */
exports.getHome = async (req, res) => {
  try {
    const user = getSessionUser(req);
    const userId = getUserId(req);

    // If user is not logged in, redirect to login
    if (!user) {
      return res.redirect('/users/login');
    }

    // Check for our one-time welcome message
    const showWelcome = req.session.showWelcomeMessage || false;
    if (showWelcome) {
      delete req.session.showWelcomeMessage; // Delete it so it only shows once
    }

    const movies = await movieModel.getAllWatchlistMovies(userId);

    res.render('index', {
      title: 'Home',
      user: user,
      csrfToken: req.csrfToken ? req.csrfToken() : '',
      movies: movies,
      totalMovies: movies.length,
      showWelcome: showWelcome,
    });
  } catch (error) {
    console.error('Error loading home page:', error);
    res.render('index', {
      title: 'Home',
      user: getSessionUser(req),
      csrfToken: req.csrfToken ? req.csrfToken() : '',
      movies: [],
      totalMovies: 0,
      showWelcome: false,
    });
  }
};

/**
 * Renders the History page showing watched movies.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>} Renders 'history' view with watched movies or redirects to login
 */
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

/**
 * Renders the User Settings page.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {void} Renders 'settings' view or redirects to login
 */
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
