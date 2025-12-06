/**
 * Index Controller
 *
 * Controllers handle the business logic for routes.
 * They process requests, interact with models, and send responses.
 *
 * Best practices:
 * - Keep controllers focused on request/response handling
 * - Move complex business logic to separate service files
 * - Use models to interact with the database
 * - Handle errors appropriately
 */

// Import models if needed
// const SomeModel = require('../models/SomeModel');

/**
 * Renders the Home page.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>} Renders the 'index' view
 */
exports.getHome = async (req, res, next) => {
  try {
    // Fetch any data needed for the home page
    // const data = await SomeModel.findAll();

    res.render('index', {
      title: 'Home',
      // data: data,
      csrfToken: req.csrfToken(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Renders the About page.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>} Renders the 'about' view
 */
exports.getAbout = async (req, res, next) => {
  try {
    res.render('about', {
      title: 'About',
      csrfToken: req.csrfToken(),
    });
  } catch (error) {
    next(error);
  }
};

// Add more controller methods as needed
