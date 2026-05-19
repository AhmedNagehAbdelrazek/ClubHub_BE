const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Club extends Model {}

Club.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [2, 100],
      },
    },
    logo_url: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'logo_url',
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    settings: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
      field: 'settings',
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active',
    },
  },
  {
    sequelize,
    modelName: 'Club',
    tableName: 'clubs',
    underscored: true,
  }
);

Club.associate = (models) => {
  Club.hasMany(models.Court, { foreignKey: 'club_id', as: 'courts' });
  Club.hasMany(models.Membership, { foreignKey: 'club_id', as: 'memberships' });
  Club.hasMany(models.ClubSport, { foreignKey: 'club_id', as: 'clubSports' });
  Club.hasMany(models.Event, { foreignKey: 'club_id', as: 'events' });
  Club.hasMany(models.Notification, { foreignKey: 'club_id', as: 'notifications' });
  Club.hasMany(models.PointsLedger, { foreignKey: 'club_id', as: 'pointsLedger' });
  Club.hasMany(models.Reward, { foreignKey: 'club_id', as: 'rewards' });
  Club.hasMany(models.StaticPage, { foreignKey: 'club_id', as: 'staticPages' });
  Club.hasMany(models.ExternalLink, { foreignKey: 'club_id', as: 'externalLinks' });
  Club.hasMany(models.Survey, { foreignKey: 'club_id', as: 'surveys' });
  Club.hasMany(models.FAQ, { foreignKey: 'club_id', as: 'faqs' });
  Club.hasMany(models.PrivateQuestion, { foreignKey: 'club_id', as: 'privateQuestions' });
};

module.exports = Club;
