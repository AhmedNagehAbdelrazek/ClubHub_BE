const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class StaticPage extends Model {}

StaticPage.init(
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
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true },
      field: 'type',
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true },
    },
    content_html: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'content_html',
    },
    attachment_url: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'attachment_url',
    },
  },
  {
    sequelize,
    modelName: 'StaticPage',
    tableName: 'static_pages',
    underscored: true,
  }
);

module.exports = StaticPage;
