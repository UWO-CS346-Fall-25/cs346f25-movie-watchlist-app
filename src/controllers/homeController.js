/**
 * Home Controller
 *
 * Contains methods for handling:
 * - Home page
 * - History page
 * - Settings page
 */

// Home page controller
exports.getHome = (req, res) => {
  res.render('index', {
    title: 'Home',
    user: req.user,
    csrfToken: req.csrfToken(),
  });
};

// History page controller
exports.getHistory = (req, res) => {
  res.render('history', {
    title: 'History',
    user: req.user,
    csrfToken: req.csrfToken(),
  });
};

// Settings page controller
exports.getSettings = (req, res) => {
  res.render('settings', {
    title: 'Settings',
    user: req.user,
    csrfToken: req.csrfToken(),
  });
};
