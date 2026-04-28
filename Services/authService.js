const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const { User } = require('../Models');
const { ApiError, ApiErrors } = require('../utils/ApiError');

/**
 * Generate a 6-digit OTP for password reset and save to user record.
 * (In production, OTP would be sent via SMS; here we return it for dev.)
 */
async function generateOtp(phone) {
  const user = await User.findOne({ where: { phone } });
  if (!user) {
    throw ApiErrors.notFound('User not found');
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.otp = otp;
  user.otp_expiry_time = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  await user.save();

  // For dev/testing, return OTP in plain text
  return { otp };
}

/**
 * Verify OTP for a phone number and, if valid, generate a password reset token.
 */
async function verifyOtpAndCreateResetToken(phone, otp) {
  const user = await User.findOne({ where: { phone } });
  if (!user) {
    throw ApiErrors.notFound('User not found');
  }

  if (!user.otp || user.otp !== otp) {
    throw ApiErrors.badRequest('Invalid OTP');
  }

  if (!user.otp_expiry_time || user.otp_expiry_time < new Date()) {
    throw ApiErrors.badRequest('OTP expired');
  }

  // Clear OTP
  user.otp = null;
  user.otp_expiry_time = null;

  // Generate password reset token using model method
  const plainToken = user.createPasswordResetToken();
  await user.save();

  return { resetToken: plainToken };
}

/**
 * Reset password using the reset token.
 */
async function resetPassword(token, newPassword) {
  // Hash the incoming token to compare
  const tokenHash = require('crypto').createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    where: {
      passwordResetToken: tokenHash,
      passwordResetExpires: { [Op.gt]: new Date() },
    },
  });

  if (!user) {
    throw ApiErrors.badRequest('Invalid or expired reset token');
  }

  // Update password and clear reset token
  user.password_hash = await bcrypt.hash(newPassword, 10);
  user.passwordResetToken = null;
  user.passwordResetExpires = null;
  // Invalidate all existing JWT tokens by updating passwordChangedAt
  user.passwordChangedAt = new Date();
  await user.save();

  return { message: 'Password reset successfully' };
}

/**
 * Obtain JWT token for user.
 */
function generateToken(user) {
  const payload = {
    id: user.id,
    phone: user.phone,
    globalRole: user.global_role,
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

/**
 * Register a new user.
 */
async function register({ name, phone, password, dob = null, gender = null }) {
  const existing = await User.findOne({ where: { phone } });
  if (existing) {
    throw ApiErrors.conflict('Phone number already registered');
  }

  const password_hash = await bcrypt.hash(password, 10);
  console.log(password, password_hash);
  const user = await User.create({
    name,
    phone,
    password_hash,
    dob,
    gender,
    global_role: 'user',
  });
  console.log('Created user:', user);

  const token = generateToken(user);
  return { user, token };
}

/**
 * Authenticate user and return token.
 */
async function login(phone, password) {
  const user = await User.findOne({ where: { phone } });
  if (!user) {
    throw ApiErrors.unauthorized('Invalid credentials, user not found with this phone number');
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  console.log('Password match:', isMatch);
  console.log(password, user.password_hash);
  if (!isMatch) {
    throw ApiErrors.unauthorized('Invalid credentials, incorrect password');
  }

  if (!user.is_active) {
    throw ApiErrors.unauthorized('Account is deactivated');
  }

  const token = generateToken(user);
  return { user, token };
}

module.exports = {
  register,
  login,
  generateOtp,
  verifyOtpAndCreateResetToken,
  resetPassword,
  verifyToken: (token) => jwt.verify(token, process.env.JWT_SECRET),
};
