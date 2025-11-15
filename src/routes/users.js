/**
 * User Routes
 *
 * Define routes related to user operations here.
 * This could include:
 * - User registration
 * - User login/logout
 * - User profile
 * - User management (admin)
 *
 * Example usage:
 * const express = require('express');
 * const router = express.Router();
 * const userController = require('../controllers/userController');
 *
 * router.get('/register', userController.getRegister);
 * router.post('/register', userController.postRegister);
 * router.get('/login', userController.getLogin);
 * router.post('/login', userController.postLogin);
 * router.post('/logout', userController.postLogout);
 *
 * module.exports = router;
 */

/* src/routes/users.js */
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// GET /users/login - Display login form
router.get('/login', userController.getLogin);

// POST /users/login - Process login form
router.post('/login', userController.postLogin);

// GET /users/register - Display registration form
router.get('/register', userController.getRegister);

// POST /users/register - Process registration form
router.post('/register', userController.postRegister);

// POST /users/logout - Logout user
router.post('/logout', userController.postLogout);

// POST /users/update-email - Update user email
router.post('/update-email', userController.postUpdateEmail);

// POST /users/update-password - Update user password
router.post('/update-password', userController.postUpdatePassword);

module.exports = router;
