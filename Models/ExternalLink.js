const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class ExternalLink extends Model {}

ExternalLink.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    club_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'clubs', key: 'id' },
      field: 'club_id',
    },
    store_url: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'store_url',
    },
    maps_url: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'maps_url',
    },
    whatsapp_url: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'whatsapp_url',
    },
    instagram_url: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'instagram_url',
    },
    facebook_url: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'facebook_url',
    },
    website_url: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'website_url',
    },
  },
  {
    sequelize,
    modelName: 'ExternalLink',
    tableName: 'external_links',
    underscored: true,
  }
);

module.exports = ExternalLink;
