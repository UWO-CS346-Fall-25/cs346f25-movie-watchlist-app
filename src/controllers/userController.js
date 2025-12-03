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

/**
 * GET /users/register
 * Display registration form
 */
exports.getRegister = (req, res) => {
  res.render('register', {
    title: 'Register',
    error: null,
    csrfToken: req.csrfToken ? req.csrfToken() : '',
  });
};

/**
 * POST /users/register
 * Process registration form
 */
exports.postRegister = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    loggingService.info('User registration attempt', {
      email: email,
      userAgent: req.get('User-Agent'),
      ip: req.ip
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

    // Register with Supabase Auth (no username)
    const result = await authService.register(email, password);

    if (!result.success) {
      loggingService.warn('Registration failed', {
        email: email,
        error: result.error,
        userAgent: req.get('User-Agent'),
        ip: req.ip
      });
      return res.render('register', {
        title: 'Register',
        error: result.error,
        csrfToken: req.csrfToken ? req.csrfToken() : '',
      });
    }

    // Success - redirect to login with success message
    loggingService.info('User registration successful', {
      email: email,
      userAgent: req.get('User-Agent'),
      ip: req.ip
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
      ip: req.ip
    });
    next(error);
  }
};

/**
 * GET /users/login
 * Display login form
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
 * POST /users/login
 * Process login form
 */
exports.postLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    loggingService.info('User login attempt', {
      email: email,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      sessionId: req.sessionID
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

    // Store user session
    req.session.user = {
      id: result.user.id,
      email: result.user.email,
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
          userId: result.user.id
        });
        return next(err);
      }
      loggingService.info('Login successful', {
        userId: result.user.id,
        sessionId: req.sessionID
      });
      res.redirect('/');
    });
  } catch (error) {
    loggingService.error('Login error', {
      error: error.message,
      stack: error.stack,
      email: req.body?.email,
      sessionId: req.sessionID
    });
    next(error);
  }
};

/**
 * POST /users/logout
 * Logout user
 */
exports.postLogout = async (req, res, next) => {
  try {
    const userId = req.session?.user?.id;
    const sessionId = req.sessionID;

    loggingService.info('User logout attempt', {
      userId,
      sessionId,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });

    // Logout from Supabase Auth
    const result = await authService.logout();

    if (!result.success) {
      loggingService.warn('Supabase logout error', {
        error: result.error,
        userId,
        sessionId
      });
      // Continue with session destruction even if Supabase logout fails
    }

    // Destroy local session
    req.session.destroy((err) => {
      if (err) {
        loggingService.error('Error destroying session', {
          error: err.message,
          userId,
          sessionId
        });
        return next(err);
      }
      
      loggingService.logSessionEnd(sessionId, userId);
      loggingService.info('Logout successful', {
        userId,
        sessionId
      });
      
      res.redirect('/users/login');
    });
  } catch (error) {
    loggingService.error('Logout error', {
      error: error.message,
      stack: error.stack,
      userId: req.session?.user?.id,
      sessionId: req.sessionID
    });
    next(error);
  }
};

/**
 * POST /users/update-email
 * Update user email
 */
exports.postUpdateEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required',
      });
    }

    const result = await authService.updateEmail(email);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error,
      });
    }

    // Update session with new email
    req.session.user.email = email;
    req.session.save();

    loggingService.info('Email updated successfully', {
      userId: req.session.user.id,
      oldEmail: req.session.user.email,
      newEmail: email
    });

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    loggingService.error('Email update error', {
      error: error.message,
      stack: error.stack,
      userId: req.session?.user?.id,
      newEmail: req.body?.email
    });
    res.status(500).json({
      success: false,
      error: 'Failed to update email',
    });
  }
};

/**
 * POST /users/update-password
 * Update user password
 */
exports.postUpdatePassword = async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;

    if (!password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        error: 'Both password fields are required',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: 'Passwords do not match',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long',
      });
    }

    const result = await authService.updatePassword(password);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error,
      });
    }

    loggingService.info('Password updated successfully', {
      userId: req.session.user.id
    });

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    loggingService.error('Password update error', {
      error: error.message,
      stack: error.stack,
      userId: req.session?.user?.id
    });
    res.status(500).json({
      success: false,
      error: 'Failed to update password',
    });
  }
};
