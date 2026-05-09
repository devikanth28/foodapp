const { Sequelize } = require('sequelize');
const config = require('./index');
const logger = require('../utils/logger');

const sequelize = new Sequelize(
  config.database.name,
  config.database.user,
  config.database.password,
  {
    host: config.database.host,
    port: config.database.port,
    dialect: 'mysql',
    logging: (msg) => {
      if (config.server.nodeEnv === 'development') {
        logger.debug(msg);
      }
    },
    pool: {
      max: 10,       // max connections in pool
      min: 0,        // min connections in pool
      acquire: 30000, // max ms to get a connection before error
      idle: 10000,   // ms a connection can be idle before release
    },
    define: {
      timestamps: true,        // adds createdAt, updatedAt to all models
      underscored: true,       // snake_case column names in DB
      freezeTableName: false,  // pluralizes table names automatically
    },
  }
);

// Test the connection
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    logger.info('✅ MySQL connected successfully');
  } catch (error) {
    logger.error('❌ MySQL connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
