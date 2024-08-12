const express = require('express');
const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/', authController.isLoggedIn, viewController.getOverview);
router.get('/book/:slug', authController.isLoggedIn, viewController.getBook);
router.get('/login', authController.isLoggedIn, viewController.getLoginForm);
router.get('/signup', viewController.getSignupForm);
router.get('/me', authController.protect, viewController.getAccount);
router.get('/cart', authController.protect, authController.getCartView);
router.get(
  '/forgotPassword',
  authController.isLoggedIn,
  viewController.getForgotPasswordForm
);
router.get(
  '/resetPassword/:token',
  authController.isLoggedIn,
  viewController.getResetPasswordForm
);

module.exports = router;
