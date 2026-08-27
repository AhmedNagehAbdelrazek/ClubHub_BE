const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { MATCH_STATUS } = require('../config/constants');

class Match extends Model {}

Match.init(
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
    court_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'courts', key: 'id' },
      field: 'court_id',
    },
    sport_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'sports', key: 'id' },
      field: 'sport_id',
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true, len: [2, 200] },
    },
    start_time: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'start_time',
    },
    end_time: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'end_time',
    },
    required_players: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 2 },
      field: 'required_players',
    },
    registration_open_time: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'registration_open_time',
    },
    status: {
      type: DataTypes.ENUM(...Object.values(MATCH_STATUS)),
      allowNull: false,
      defaultValue: MATCH_STATUS.SCHEDULED,
      field: 'status',
    },
    winner_team: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'winner_team',
    },
    score_summary: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'score_summary',
    },
  },
  {
    sequelize,
    modelName: 'Match',
    tableName: 'matches',
    underscored: true,
    indexes: [
      { fields: ['court_id', 'start_time', 'end_time', 'status'] },
    ],
  }
);

module.exports = Match;
