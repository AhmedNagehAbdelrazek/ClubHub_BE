const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const sequelize = require('../config/database');
const { ROLES } = require('../config/constants');

class User extends Model {
  /**
   * Verify provided OTP matches stored OTP.
   */
  correctOTP(otp) {
    return otp === this.otp;
  }

  /**
   * Generate a password reset token and its hashed version.
   * Returns the plain token to be sent to user.
   */
  createPasswordResetToken() {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    return resetToken;
  }

  /**
   * Check if JWT timestamp is after password was changed.
   */
  changedPasswordAfterTokenChanged(JWTTimeStamp) {
    if (this.passwordChangedAt) {
      const changedTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
      return JWTTimeStamp < changedTimeStamp;
    }
    return false;
  }

  /**
   * Compare plain password with stored hash.
   */
  async comparePassword(password) {
    return await bcrypt.compare(password, this.password_hash);
  }
}

User.init(
  {
    // Primary key
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    // Required basic profile
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [2, 100],
      },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: { min: 10, max: 14 },
        isPhoneNumber(value) {
          if (!/^\+?[0-9]{10,14}$/.test(value)) {
            throw new Error('Invalid phone number format');
          }
        },
      },
    },

    // Optional personal info
    dob: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    gender: {
      type: DataTypes.ENUM('male', 'female', 'other', 'prefer_not_to_say'),
      allowNull: true,
    },
    profile_picture_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    // Authentication
    password_hash: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    passwordChangedAt: {
      type: DataTypes.DATE,
      field: 'password_changed_at',
      allowNull: true,
    },

    // OTP for verification/password reset
    otp: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    otp_expiry_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    passwordResetToken: {
      type: DataTypes.STRING,
      field: 'password_reset_token',
      allowNull: true,
    },
    passwordResetExpires: {
      type: DataTypes.DATE,
      field: 'password_reset_expires',
      allowNull: true,
    },

    // Authorization
    global_role: {
      type: DataTypes.ENUM(...Object.values(ROLES)),
      allowNull: false,
      defaultValue: ROLES.USER,
      field: 'global_role',
    },

    // Status flags
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active',
    },

    // Runtime tracking (non-persisted across restarts)
    online: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    socketId: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    hooks: {
      beforeSave: async (user) => {
        if (user.changed('password_hash')) {
          user.password_hash = await bcrypt.hash(user.password_hash, 10);
        }
      },
    },
    sequelize,
    modelName: 'User',
    tableName: 'users',
    underscored: true,
  }
);

/**
 * Define model associations (called from Models/index.js)
 * @param {Object} models
 */
User.associate = (models) => {
  // A user can have many memberships
  if (models.Membership) {
    User.hasMany(models.Membership, { foreignKey: 'user_id', as: 'memberships' });
    User.hasMany(models.CourtBooking, { foreignKey: 'user_id', as: 'bookings' });
    User.hasMany(models.MatchRegistration, { foreignKey: 'user_id', as: 'matchRegistrations' });
    User.hasMany(models.TrainingRegistration, { foreignKey: 'user_id', as: 'trainingRegistrations' });
    User.hasMany(models.EventParticipant, { foreignKey: 'user_id', as: 'eventParticipations' });
    User.hasMany(models.PlayerRating, { foreignKey: 'player_id', as: 'receivedRatings' });
    User.hasMany(models.PlayerRating, { foreignKey: 'rated_by', as: 'givenRatings' });
    User.hasMany(models.PointsLedger, { foreignKey: 'user_id', as: 'pointsLedger' });
    User.hasMany(models.Redemption, { foreignKey: 'user_id', as: 'redemptions' });
    User.hasMany(models.NotificationRecipient, { foreignKey: 'user_id', as: 'notificationRecipients' });
  }
};

module.exports = User;
