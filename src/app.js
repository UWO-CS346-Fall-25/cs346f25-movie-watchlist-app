/**
 * Main Application File
 *
 * Sets up the Express server, middleware, and routes
 */

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();

// Import routes
const mainRoutes = require('./routes/index');
const apiRoutes = require('./routes/api');

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', mainRoutes);
app.use('/api', apiRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).render('error', {
    title: '404 - Page Not Found',
    message:
      'The page you are looking for might have been removed or is temporarily unavailable.',
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', {
    title: '500 - Server Error',
    message: 'Something went wrong on our end. Please try again later.',
  });
});

module.exports = app;
