const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const db = {};

// Auto-load all model files in this directory (except index.js)
fs.readdirSync(__dirname)
  .filter((file) => file !== 'index.js' && file.endsWith('.js'))
  .forEach((file) => {
    const modelModule = require(path.join(__dirname, file));
    const model = modelModule.default || modelModule;
    db[model.name] = model;
  });

// Run associate functions (if defined) to set up relationships
Object.values(db).forEach((model) => {
  if (typeof model.associate === 'function') {
    model.associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
