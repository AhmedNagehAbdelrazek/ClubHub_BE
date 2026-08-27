const { body, validationResult } = require('express-validator');
const { validate } = require('../middlewares/validatorMiddleware');
const authService = require('../Services/authService');
const { successResponse } = require('../utils/httpResponse');
const {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  verifyOtpValidation,
  resetPasswordValidation,
} = require('../utils/validators/authValidator');

/**
 * POST /api/v1/auth/register
 */
const register = [...registerValidation, validate, async (req, res, next) => {
  try {
    const { name, phone, password, dob, gender } = req.body;
    const result = await authService.register({ name, phone, password, dob, gender });
    successResponse(res, result, 201);
  } catch (err) {
    next(err);
  }
}];

/**
 * POST /api/v1/auth/login
 */
const login = [...loginValidation, validate, async (req, res, next) => {
  try {
    const { phone, password } = req.body;
    const result = await authService.login(phone, password);
    successResponse(res, result, 200);
  } catch (err) {
    next(err);
  }
}];

/**
 * POST /api/v1/auth/forgot-password
 * Initiates password reset by generating OTP.
 */
const forgotPassword = [
  body('phone').notEmpty().withMessage('Phone is required'),
  validate,
  async (req, res, next) => {
    try {
      const { phone } = req.body;
      const result = await authService.generateOtp(phone);
      // In dev, we return OTP; in prod we would send via SMS and not return it.
      successResponse(res, result, 200);
    } catch (err) {
      next(err);
    }
  },
];

/**
 * POST /api/v1/auth/verify-otp
 * Verifies OTP and returns reset token.
 */
const verifyOtp = [
  body('phone').notEmpty(),
  body('otp').notEmpty(),
  validate,
  async (req, res, next) => {
    try {
      const { phone, otp } = req.body;
      const result = await authService.verifyOtpAndCreateResetToken(phone, otp);
      successResponse(res, result, 200);
    } catch (err) {
      next(err);
    }
  },
];

/**
 * POST /api/v1/auth/reset-password
 * Resets password using reset token.
 */
const resetPassword = [
  body('token').notEmpty(),
  body('password')
    .notEmpty()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('confirmPassword')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match'),
  validate,
  async (req, res, next) => {
    try {
      const { token, password } = req.body;
      const result = await authService.resetPassword(token, password);
      successResponse(res, result, 200);
    } catch (err) {
      next(err);
    }
  },
];

module.exports = {
  register,
  login,
  forgotPassword,
  verifyOtp,
  resetPassword,
};
