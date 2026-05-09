const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Address = sequelize.define('Address', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  addressLine: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'addresses',
  underscored: true,
});

module.exports = Address;