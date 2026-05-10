const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Address = sequelize.define('Address', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },

  address_line: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  city: {
    type: DataTypes.STRING,
  },

  pincode: {
    type: DataTypes.STRING,
  },
}, {
  tableName: 'addresses',
  underscored: true,
});

module.exports = Address;