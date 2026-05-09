const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Restaurant = sequelize.define('Restaurant', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  phone: {
    type: DataTypes.STRING(15),
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: false,
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: false,
  },
  coverImage: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  logo: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  cuisine: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  rating: {
    type: DataTypes.DECIMAL(2, 1),
    defaultValue: 0.0,
    validate: { min: 0, max: 5 },
  },
  totalRatings: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  deliveryTime: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Estimated delivery time in minutes',
  },
  deliveryFee: {
    type: DataTypes.DECIMAL(8, 2),
    defaultValue: 0,
  },
  minimumOrder: {
    type: DataTypes.DECIMAL(8, 2),
    defaultValue: 0,
  },
  isOpen: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  openingTime: {
    type: DataTypes.TIME,
    allowNull: true,
  },
  closingTime: {
    type: DataTypes.TIME,
    allowNull: true,
  },
}, {
  tableName: 'restaurants',
  underscored: true, // camelCase JS fields → snake_case DB columns
  indexes: [
    { fields: ['category'] },
    { fields: ['city'] },
    { fields: ['is_open'] },
    { fields: ['latitude', 'longitude'] },
  ],
});

module.exports = Restaurant;