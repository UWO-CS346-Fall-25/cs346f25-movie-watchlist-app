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
    const { username, email, password } = req.body;

    console.log('Registration attempt for:', email);

    // Validate input
    if (!username || !email || !password) {
      return res.render('register', {
        title: 'Register',
        error: 'All fields are required',
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

    // Register with Supabase Auth
    const result = await authService.register(email, password, username);

    if (!result.success) {
      return res.render('register', {
        title: 'Register',
        error: result.error,
        csrfToken: req.csrfToken ? req.csrfToken() : '',
      });
    }

    // Success - redirect to login with success message
    res.render('login', {
      title: 'Login',
      success: result.message,
      error: null,
      csrfToken: req.csrfToken ? req.csrfToken() : '',
    });
  } catch (error) {
    console.error('Registration error:', error);
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

    console.log('Login attempt for:', email);

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
      username:
        result.user.user_metadata?.username || result.user.email.split('@')[0],
    };

    req.session.supabaseSession = {
      access_token: result.session.access_token,
      refresh_token: result.session.refresh_token,
      expires_at: result.session.expires_at,
    };

    // Save session and redirect
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return next(err);
      }
      console.log('Login successful, redirecting to home');
      res.redirect('/');
    });
  } catch (error) {
    console.error('Login error:', error);
    next(error);
  }
};

/**
 * POST /users/logout
 * Logout user
 */
exports.postLogout = async (req, res, next) => {
  try {
    // Logout from Supabase Auth
    const result = await authService.logout();

    if (!result.success) {
      console.error('Supabase logout error:', result.error);
      // Continue with session destruction even if Supabase logout fails
    }

    // Destroy local session
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
        return next(err);
      }
      console.log('Logout successful, redirecting to login');
      res.redirect('/users/login');
    });
  } catch (error) {
    console.error('Logout error:', error);
    next(error);
  }
};
