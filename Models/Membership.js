const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { MEMBERSHIP_STATUS, CLUB_ROLES } = require('../config/constants');

class Membership extends Model {
  // Instance methods for state transitions can be added here
  async approve(decidedByUserId) {
    this.status = MEMBERSHIP_STATUS.APPROVED;
    this.decision_at = new Date();
    this.decision_by = decidedByUserId;
    this.joined_at = new Date();
    await this.save();
    return this;
  }

  async reject(decidedByUserId) {
    this.status = MEMBERSHIP_STATUS.REJECTED;
    this.decision_at = new Date();
    this.decision_by = decidedByUserId;
    await this.save();
    return this;
  }

  async deactivate() {
    this.status = MEMBERSHIP_STATUS.DEACTIVATED;
    await this.save();
    return this;
  }
}

Membership.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    club_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'clubs', key: 'id' },
    },
    status: {
      type: DataTypes.ENUM(...Object.values(MEMBERSHIP_STATUS)),
      allowNull: false,
      defaultValue: MEMBERSHIP_STATUS.PENDING,
    },
    club_role: {
      type: DataTypes.ENUM(...Object.values(CLUB_ROLES)),
      allowNull: false,
      defaultValue: CLUB_ROLES.MEMBER,
    },
    joined_at: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'joined_at',
    },
    decision_at: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'decision_at',
    },
    decision_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'users', key: 'id' },
      field: 'decision_by',
    },
  },
  {
    sequelize,
    modelName: 'Membership',
    tableName: 'memberships',
    underscored: true,
    indexes: [
      { fields: ['user_id', 'club_id'], unique: true },
      { fields: ['status'] },
    ],
  }
);

Membership.associate = (models) => {
  Membership.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  Membership.belongsTo(models.Club, { foreignKey: 'club_id', as: 'club' });
  Membership.belongsTo(models.User, {
    foreignKey: 'decision_by',
    as: 'decidedBy',
  });
};

module.exports = Membership;
