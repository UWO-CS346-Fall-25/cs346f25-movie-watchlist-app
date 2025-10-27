/**
 * User Controller
 *
 * Handles user-related operations:
 * - Registration
 * - Login/Logout
 * - Profile management
 * - Authentication
 */

// Import models
// const User = require('../models/User');

/**
 * GET /users/register
 * Display registration form
 */
exports.getRegister = (req, res) => {
  // We'll create this 'register.ejs' file in the next step
  res.render('register', {
    title: 'Register',
    // We'll add csrfToken here later when we add the POST route
  });
};

/**
 * POST /users/register
 * Process registration form
 */
exports.postRegister = async (req, res, next) => {
  try {
    console.log('Registration attempt:', req.body);

    // As requested, redirect to login after registering
    res.redirect('/users/login');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /users/login
 * Display login form
 */
// Placeholder for login page
exports.getLogin = (req, res) => {
  res.render('login', {
    title: 'Login',
  });
};

/**
 * POST /users/login
 * Process login form
 */
// Placeholder for login processing
/* This function now simulates a login */
exports.postLogin = async (req, res, next) => {
  try {
    // In a real app, you'd find the user and check their password.
    // For this deliverable, we can just "log them in"
    // by setting the session.
    req.session.user = {
      id: 1, // Placeholder user ID
      username: req.body.email, // Just use their email as their name for now
    };

    // Save the session and redirect to the home page
    req.session.save((err) => {
      if (err) {
        return next(err);
      }
      res.redirect('/');
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /users/logout
 * Logout user
 */
exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return next(err);
    }
    // Explicitly redirect to the login page, as you suggested!
    res.redirect('/users/login');
  });
};
