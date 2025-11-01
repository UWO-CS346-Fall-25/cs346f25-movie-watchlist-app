/**
 * Main Application File
 *
 * Sets up the Express server, middleware, and routes
 */

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
// NEW: Import csurf
const csurf = require('csurf');
const app = express();

// Import routes
const mainRoutes = require('./routes/index');
const apiRoutes = require('./routes/api');
const userRoutes = require('./routes/users');

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'a-very-weak-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

// NEW: Initialize csurf middleware
// This must come *after* session middleware
const csrfProtection = csurf({ cookie: false });
app.use(csrfProtection);

// NEW: Make user and CSRF token available in all templates
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.csrfToken = req.csrfToken(); // Pass CSRF token to all views
  next();
});

// Authentication Wall Middleware
app.use((req, res, next) => {
  // Allow access to login, register, and static files
  if (
    req.path.startsWith('/users') ||
    req.path.startsWith('/css') ||
    req.path.startsWith('/js')
  ) {
    return next();
  }

  // Check if user is logged in
  if (req.session.user) {
    return next();
  }

  // User is NOT logged in and trying to access a protected page
  res.redirect('/users/login');
});

// Routes
app.use('/', mainRoutes);
app.use('/api', apiRoutes);
app.use('/users', userRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).render('error', {
    title: '404 - Page Not Found',
    message:
      'The page you are looking for might have been removed or is temporarily unavailable.',
    error: { status: 404 },
  });
});

// Error handler
app.use((err, req, res, next) => {
  // Handle csurf errors
  if (err.code === 'EBADCSRFTOKEN') {
    res.status(403).render('error', {
      title: '403 - Forbidden',
      message: 'Invalid security token. Please try again.',
      error: { status: 403 },
    });
    return;
  }

  console.error(err.stack);
  const status = err.status || 500;
  res.status(status).render('error', {
    title: 'Server Error',
    message: 'Something went wrong on our end. Please try again later.',
    error: {
      status: status,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    },
  });
});

module.exports = app;
