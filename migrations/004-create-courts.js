'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('courts', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      club_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'clubs', key: 'id' },
        field: 'club_id',
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      capacity: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      hourly_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        field: 'hourly_price',
      },
      surface_type: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'surface_type',
      },
      location_description: {
        type: Sequelize.TEXT,
        allowNull: true,
        field: 'location_description',
      },
      is_indoor: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_indoor',
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'is_active',
      },
      createdat: {
        allowNull: false,
        field: 'createdat',
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        allowNull: false,
        field: 'updated_at',
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Add unique index on (club_id, name) to ensure court names unique per club
    await queryInterface.addIndex('courts', ['club_id', 'name'], { unique: true, name: 'unique_court_name_per_club' });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('courts');
  },
};
