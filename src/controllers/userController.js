/**
 * User Controller
 *
 * Handles user-related operations with Supabase Auth:
 * - Registration
 * - Login/Logout
 * - Profile management
 * - Authentication
 */

const authService = require('../services/authService');
const loggingService = require('../services/loggingService');
const User = require('../models/User'); // Required for profile updates

/**
 * Display registration form.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getRegister = (req, res) => {
  res.render('register', {
    title: 'Register',
    error: null,
    csrfToken: req.csrfToken ? req.csrfToken() : '',
  });
};

/**
 * Processes user registration with Supabase Auth.
 *
 * @param {Object} req - Express request object
 * @param {string} req.body.email - The user's email address
 * @param {string} req.body.password - The user's password (min 6 characters)
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>} Renders 'login' view on success, or 'register' view on failure
 */
exports.postRegister = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    loggingService.info('User registration attempt', {
      email: email,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
    });

    // Validate input
    if (!email || !password) {
      return res.render('register', {
        title: 'Register',
        error: 'Email and password are required',
        csrfToken: req.csrfToken ? req.csrfToken() : '',
      });
    }

    if (password.length < 6) {
      return res.render('register', {
        title: 'Register',
        error: 'Password must be at least 6 characters long',
        csrfToken: req.csrfToken ? req.csrfToken() : '',
      });
    }

    // Check if email already exists in our database
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      loggingService.warn('Registration failed - email already exists', {
        email: email,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
      });
      return res.render('register', {
        title: 'Register',
        error:
          'An account with this email already exists. Please use a different email or try logging in.',
        csrfToken: req.csrfToken ? req.csrfToken() : '',
      });
    }

    // Register with Supabase Auth
    const result = await authService.register(email, password);

    if (!result.success) {
      loggingService.warn('Registration failed', {
        email: email,
        error: result.error,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
      });
      return res.render('register', {
        title: 'Register',
        error: result.error,
        csrfToken: req.csrfToken ? req.csrfToken() : '',
      });
    }

    // Success - redirect to login
    loggingService.info('User registration successful', {
      email: email,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
    });

    res.render('login', {
      title: 'Login',
      success: result.message,
      error: null,
      csrfToken: req.csrfToken ? req.csrfToken() : '',
    });
  } catch (error) {
    loggingService.error('Registration error', {
      error: error.message,
      stack: error.stack,
      email: req.body?.email,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
    });
    next(error);
  }
};

/**
 * Display login form.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getLogin = (req, res) => {
  res.render('login', {
    title: 'Login',
    error: null,
    success: null,
    csrfToken: req.csrfToken ? req.csrfToken() : '',
  });
};

/**
 * Authenticates user credentials and initializes the server session.
 *
 * @param {Object} req - Express request object
 * @param {string} req.body.email - The user's email
 * @param {string} req.body.password - The user's password
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>} Redirects to Home ('/') on success, or renders 'login' on failure
 */
exports.postLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    loggingService.info('User login attempt', {
      email: email,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      sessionId: req.sessionID,
    });

    // Validate input
    if (!email || !password) {
      return res.render('login', {
        title: 'Login',
        error: 'Email and password are required',
        success: null,
        csrfToken: req.csrfToken ? req.csrfToken() : '',
      });
    }

    // Login with Supabase Auth
    const result = await authService.login(email, password);

    if (!result.success) {
      return res.render('login', {
        title: 'Login',
        error: result.error,
        success: null,
        csrfToken: req.csrfToken ? req.csrfToken() : '',
      });
    }

    // Fetch the profile image from the public table to store in session
    const userProfile = await User.findById(result.user.id);

    // Store user session
    req.session.user = {
      id: result.user.id,
      email: result.user.email,
      profile_image_url: userProfile ? userProfile.profile_image_url : null,
    };

    req.session.supabaseSession = {
      access_token: result.session.access_token,
      refresh_token: result.session.refresh_token,
      expires_at: result.session.expires_at,
    };

    // Log session creation
    loggingService.logSessionStart(req.sessionID, result.user.id);

    // show welcome message on login
    req.session.showWelcomeMessage = true;

    // Save session and redirect
    req.session.save((err) => {
      if (err) {
        loggingService.error('Session save error', {
          error: err.message,
          userId: result.user.id,
        });
        return next(err);
      }
      loggingService.info('Login successful', {
        userId: result.user.id,
        sessionId: req.sessionID,
      });
      res.redirect('/');
    });
  } catch (error) {
    loggingService.error('Login error', {
      error: error.message,
      stack: error.stack,
      email: req.body?.email,
      sessionId: req.sessionID,
    });
    next(error);
  }
};

/**
 * Destroys the user session and handles Supabase logout.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>} Redirects to the login page
 */
exports.postLogout = async (req, res, next) => {
  try {
    const userId = req.session?.user?.id;
    const sessionId = req.sessionID;

    loggingService.info('User logout attempt', {
      userId,
      sessionId,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
    });

    // Logout from Supabase Auth
    const result = await authService.logout();

    if (!result.success) {
      loggingService.warn('Supabase logout error', {
        error: result.error,
        userId,
        sessionId,
      });
    }

    // Destroy local session
    req.session.destroy((err) => {
      if (err) {
        loggingService.error('Error destroying session', {
          error: err.message,
          userId,
          sessionId,
        });
        return next(err);
      }

      loggingService.logSessionEnd(sessionId, userId);
      loggingService.info('Logout successful', {
        userId,
        sessionId,
      });

      res.redirect('/users/login');
    });
  } catch (error) {
    loggingService.error('Logout error', {
      error: error.message,
      stack: error.stack,
      userId: req.session?.user?.id,
      sessionId: req.sessionID,
    });
    next(error);
  }
};

/**
 * Updates the authenticated user's email address.
 */
exports.postUpdateEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const accessToken = req.session?.supabaseSession?.access_token;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, error: 'Email is required' });
    }

    // Store old email for logging
    const oldEmail = req.session.user.email;

    const result = await authService.updateEmail(email, accessToken);

    if (!result.success) {
      loggingService.warn('Email update failed', { error: result.error });
      return res.status(400).json({ success: false, error: result.error });
    }

    // Update session with new email
    req.session.user.email = email;
    req.session.save();

    loggingService.info('Email updated successfully', {
      userId: req.session.user.id,
      oldEmail: oldEmail,
      newEmail: email,
    });

    // CHANGED: Return JSON instead of redirect
    res.json({ success: true, message: 'Email updated successfully' });
  } catch (error) {
    loggingService.error('Email update error', {
      error: error.message,
      stack: error.stack,
      userId: req.session?.user?.id,
    });
    res
      .status(500)
      .json({ success: false, error: 'Server error updating email' });
  }
};

/**
 * Updates the authenticated user's password.
 */
exports.postUpdatePassword = async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;
    const accessToken = req.session?.supabaseSession?.access_token;

    if (!password || !confirmPassword) {
      return res
        .status(400)
        .json({ success: false, error: 'All fields are required' });
    }

    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ success: false, error: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ success: false, error: 'Password must be 6+ characters' });
    }

    const result = await authService.updatePassword(password, accessToken);

    if (!result.success) {
      loggingService.warn('Password update failed', { error: result.error });
      return res.status(400).json({ success: false, error: result.error });
    }

    loggingService.info('Password updated successfully', {
      userId: req.session.user.id,
    });

    // CHANGED: Return JSON instead of redirect
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    loggingService.error('Password update error', {
      error: error.message,
      stack: error.stack,
      userId: req.session?.user?.id,
    });
    res
      .status(500)
      .json({ success: false, error: 'Server error updating password' });
  }
};

/**
 * Processes the avatar image upload.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>} Redirects to settings page
 */
exports.postUploadAvatar = async (req, res) => {
  try {
    const userId = req.session?.user?.id;
    // CRITICAL: We retrieve the token here to pass it to the User model
    // This allows the Supabase client to pass RLS checks
    const accessToken = req.session?.supabaseSession?.access_token;

    if (!req.file) {
      return res.redirect('/settings');
    }

    // Path relative to 'public' folder so browser can see it
    const imageUrl = '/uploads/' + req.file.filename;

    // Update DB with the correct column name 'profile_image_url'
    // We pass accessToken so Supabase allows the RLS update
    await User.updateAvatar(userId, imageUrl, accessToken);

    // Update Session immediately so the user sees the change without logging out
    if (req.session.user) {
      req.session.user.profile_image_url = imageUrl;
    }

    // Log success
    loggingService.info('User updated profile picture', {
      userId: userId,
      filename: req.file.filename,
    });

    res.redirect(
      '/settings?success=' +
        encodeURIComponent('Profile picture updated successfully!')
    );
  } catch (error) {
    loggingService.error('Avatar upload error', { error: error.message });
    res.redirect(
      '/settings?error=' +
        encodeURIComponent(
          'Failed to update profile picture. Please try again.'
        )
    );
  }
};

/**
 * Clear all watchlist data for the authenticated user.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>} JSON response with success/error status
 */
exports.postClearWatchlistData = async (req, res) => {
  try {
    const userId = req.session?.user?.id;
    const accessToken = req.session?.supabaseSession?.access_token;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }

    // Clear all movies for this user
    const movieModel = require('../models/movieModel');
    const result = await movieModel.clearAllUserMovies(userId, accessToken);

    if (!result) {
      return res.status(500).json({
        success: false,
        error: 'Failed to clear watchlist data',
      });
    }

    loggingService.info('User cleared all watchlist data', {
      userId: userId,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
    });

    res.json({
      success: true,
      message: 'All watchlist data has been cleared successfully',
    });
  } catch (error) {
    loggingService.error('Clear watchlist data error', {
      error: error.message,
      stack: error.stack,
      userId: req.session?.user?.id,
    });
    res.status(500).json({
      success: false,
      error: 'Server error clearing watchlist data',
    });
  }
};

/**
 * Delete the authenticated user's account completely.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>} JSON response with success/error status
 */
exports.postDeleteAccount = async (req, res) => {
  try {
    const userId = req.session?.user?.id;
    const accessToken = req.session?.supabaseSession?.access_token;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }

    // First clear all user's movies
    const movieModel = require('../models/movieModel');
    await movieModel.clearAllUserMovies(userId, accessToken);

    // Delete user from Supabase Auth and database
    const result = await authService.deleteAccount(accessToken);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error || 'Failed to delete account',
      });
    }

    // Delete user record from our database
    await User.delete(userId);

    loggingService.info('User account deleted', {
      userId: userId,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
    });

    // Destroy session
    req.session.destroy();

    res.json({
      success: true,
      message: 'Account deleted successfully',
      redirect: '/users/login',
    });
  } catch (error) {
    loggingService.error('Delete account error', {
      error: error.message,
      stack: error.stack,
      userId: req.session?.user?.id,
    });
    res.status(500).json({
      success: false,
      error: 'Server error deleting account',
    });
  }
};
