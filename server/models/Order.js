const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  orderNumber: {
    type: DataTypes.STRING(20),
    unique: true,
    allowNull: false,
    comment: 'Human-readable e.g. FA-20240115-0001',
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' },
  },
  restaurantId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'restaurants', key: 'id' },
  },
  addressId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'addresses', key: 'id' },
  },
  status: {
    type: DataTypes.ENUM(
      'pending',
      'confirmed',
      'preparing',
      'ready',
      'out_for_delivery',
      'delivered',
      'cancelled'
    ),
    defaultValue: 'pending',
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  deliveryFee: {
    type: DataTypes.DECIMAL(8, 2),
    defaultValue: 0,
  },
  taxes: {
    type: DataTypes.DECIMAL(8, 2),
    defaultValue: 0,
  },
  discount: {
    type: DataTypes.DECIMAL(8, 2),
    defaultValue: 0,
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  paymentMethod: {
    type: DataTypes.ENUM('razorpay', 'cod', 'wallet'),
    allowNull: false,
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
    defaultValue: 'pending',
  },
  razorpayOrderId: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  razorpayPaymentId: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  deliveryAddress: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: 'Snapshot of address at time of order',
  },
  estimatedDeliveryTime: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  deliveredAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  cancelledAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  cancellationReason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  specialInstructions: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'orders',
  underscored: true, // camelCase JS fields → snake_case DB columns
  indexes: [
    { fields: ['user_id'] },
    { fields: ['restaurant_id'] },
    { fields: ['status'] },
    { fields: ['order_number'], unique: true },
  ],
});

const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  orderId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'orders', key: 'id' },
  },
  menuItemId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'menu_items', key: 'id' },
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: 'Snapshot of item name at time of order',
  },
  price: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: false,
    comment: 'Price at time of order',
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1 },
  },
  totalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
}, {
  tableName: 'order_items',
  underscored: true, // camelCase JS fields → snake_case DB columns
  indexes: [
    { fields: ['order_id'] },
  ],
});

module.exports = { Order, OrderItem };