const router = require('express').Router();
const authController = require('../Controllers/authController');
const rateLimit = require('../middlewares/rateLimitAuth');

// Apply rate limiting to auth-sensitive endpoints
// 5 requests per 15 minutes per IP for forgot/verify/reset; and 5 per 15 for login
const authLimiter = rateLimit(15 * 60 * 1000, 5);

router.post('/register', ...authController.register);
router.post('/login', authLimiter, ...authController.login);
router.post('/forgot-password', authLimiter, ...authController.forgotPassword);
router.post('/verify-otp', authLimiter, ...authController.verifyOtp);
router.post('/reset-password', authLimiter, ...authController.resetPassword);

module.exports = router;
