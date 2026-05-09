const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MenuItem = sequelize.define('MenuItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  restaurantId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'restaurants', key: 'id' },
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  price: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: false,
  },
  discountedPrice: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: true,
  },
  image: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  isVeg: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isAvailable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  isBestseller: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  spiceLevel: {
    type: DataTypes.ENUM('none', 'mild', 'medium', 'hot', 'extra_hot'),
    defaultValue: 'none',
  },
  preparationTime: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Time in minutes',
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'menu_items',
  underscored: true, // camelCase JS fields → snake_case DB columns
  indexes: [
    { fields: ['restaurant_id'] },
    { fields: ['category'] },
    { fields: ['is_available'] },
  ],
});

module.exports = MenuItem;