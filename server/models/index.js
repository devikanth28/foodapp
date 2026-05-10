'use strict';

const User       = require('./User');
const Restaurant = require('./Restaurant');
const Address    = require('./Address');
const MenuItem   = require('./MenuItem');
const { Order, OrderItem } = require('./Order'); // Order.js exports both
const Review     = require('./Review');

// ── Associations ──────────────────────────────────

User.hasMany(Order,    { foreignKey: 'userId' });
Order.belongsTo(User,  { foreignKey: 'userId' });

Restaurant.hasMany(Order, {
  foreignKey: 'restaurantId',
});

Order.belongsTo(Restaurant, {
  foreignKey: 'restaurantId',
  as: 'restaurant',
});

Restaurant.hasMany(MenuItem, {
  foreignKey: 'restaurantId',
  as: 'menuItems'
});

MenuItem.belongsTo(Restaurant, {
  foreignKey: 'restaurantId',
  as: 'restaurant'
});

Order.hasMany(OrderItem, {
  foreignKey: 'orderId',
  as: 'items',
});

OrderItem.belongsTo(Order, {
  foreignKey: 'orderId',
});

MenuItem.hasMany(OrderItem,     { foreignKey: 'menuItemId' });
OrderItem.belongsTo(MenuItem,   { foreignKey: 'menuItemId' });

Restaurant.hasMany(Review,      { foreignKey: 'restaurantId' });
Review.belongsTo(Restaurant,    { foreignKey: 'restaurantId' });

User.hasMany(Review,            { foreignKey: 'userId' });
Review.belongsTo(User,          { foreignKey: 'userId' });

module.exports = { User, Restaurant, Address, MenuItem, Order, OrderItem, Review };