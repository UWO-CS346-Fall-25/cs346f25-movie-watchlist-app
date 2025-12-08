/**
 * User Routes
 *
 * Define routes related to user operations here.
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // REQUIRED: To check if folders exist

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // 1. Resolve the absolute path to src/public/uploads
    // __dirname is 'src/routes', so we go up one level (..) to 'src', then into 'public/uploads'
    const uploadPath = path.join(__dirname, '../public/uploads');

    // 2. Check if folder exists, if not, create it automatically
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Naming: user-ID-timestamp.ext
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'user-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// Setup upload middleware with limits and filters
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed.'), false);
    }
  },
});

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

// POST /users/upload-avatar - Handle image upload
router.post(
  '/upload-avatar',
  (req, res, next) => {
    upload.single('avatar')(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.redirect(
            '/settings?error=' +
              encodeURIComponent('File too large. Maximum size is 5MB.')
          );
        }
        return res.redirect(
          '/settings?error=' +
            encodeURIComponent('File upload error: ' + err.message)
        );
      } else if (err) {
        return res.redirect(
          '/settings?error=' + encodeURIComponent(err.message)
        );
      }
      next();
    });
  },
  userController.postUploadAvatar
);

// POST /users/clear-watchlist - Clear all watchlist data
router.post('/clear-watchlist', userController.postClearWatchlistData);

// POST /users/delete-account - Delete user account
router.post('/delete-account', userController.postDeleteAccount);

module.exports = router;
