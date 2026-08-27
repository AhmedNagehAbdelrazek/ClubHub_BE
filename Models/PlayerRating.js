const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class PlayerRating extends Model {}

PlayerRating.init(
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
    match_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'matches', key: 'id' },
      field: 'match_id',
    },
    player_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      field: 'player_id',
    },
    rated_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      field: 'rated_by',
    },
    stars: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 5 },
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'PlayerRating',
    tableName: 'player_ratings',
    underscored: true,
    indexes: [{ fields: ['player_id'] }, { fields: ['match_id'] }],
  }
);

module.exports = PlayerRating;
