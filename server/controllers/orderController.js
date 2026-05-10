const { sequelize } = require('../config/database');
const { Order, OrderItem, MenuItem, Restaurant, Address } = require('../models');
const { errorResponse } = require('../utils/apiResponse');

// ── Helper: generate unique order number ──────────────────────────────────
// Format: FA-20240115-4521
const generateOrderNumber = () => {
  const date   = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(1000 + Math.random() * 9000); // 4 digit random
  return `FA-${date}-${random}`;
};

// ── POST /api/orders ──────────────────────────────────────────────────────
// Place a new order
// Body: { restaurantId, addressId, items: [{menuItemId, quantity}], paymentMethod, specialInstructions }
const placeOrder = async (req, res, next) => {
  // We use a transaction so if anything fails midway,
  // everything rolls back — no half-created orders in DB
  const transaction = await sequelize.transaction();

  try {
    const {
      restaurantId,
      addressId,
      items,            // [{ menuItemId, quantity }]
      paymentMethod,
      specialInstructions,
    } = req.body;

    // ── Step 1: Validate required fields ─────────────────────────────────
    if (!restaurantId || !addressId || !items?.length || !paymentMethod) {
      await transaction.rollback();
      return errorResponse(res, 'Please provide restaurantId, addressId, items and paymentMethod', 400);
    }

    // ── Step 2: Check restaurant exists and is open ───────────────────────
    const restaurant = await Restaurant.findOne({
      where: { id: restaurantId, isActive: true, isOpen: true },
      transaction,
    });
    if (!restaurant) {
      await transaction.rollback();
      return errorResponse(res, 'Restaurant not found or is currently closed', 404);
    }

    // ── Step 3: Check delivery address belongs to this user ───────────────
    const address = await Address.findOne({
  where: { id: addressId, user_id: req.user.id },
  transaction,
});
    if (!address) {
      await transaction.rollback();
      return errorResponse(res, 'Delivery address not found', 404);
    }

    // ── Step 4: Validate all menu items ──────────────────────────────────
    const menuItemIds = items.map(i => i.menuItemId);
    const menuItems   = await MenuItem.findAll({
      where: {
        id:           menuItemIds,
        restaurantId: restaurantId, // all items must be from same restaurant
        isAvailable:  true,
      },
      transaction,
    });

    // Check every requested item was found
    if (menuItems.length !== menuItemIds.length) {
      await transaction.rollback();
      return errorResponse(res, 'One or more menu items are unavailable or not from this restaurant', 400);
    }

    // ── Step 5: Calculate totals ──────────────────────────────────────────
    const menuItemMap = {};
    menuItems.forEach(item => { menuItemMap[item.id] = item; });

    let subtotal = 0;
    const orderItemsData = items.map(({ menuItemId, quantity }) => {
      const menuItem   = menuItemMap[menuItemId];
      const unitPrice  = parseFloat(menuItem.discountedPrice || menuItem.price);
      const totalPrice = unitPrice * quantity;
      subtotal        += totalPrice;

      return {
        menuItemId,
        name:       menuItem.name,       // snapshot at time of order
        price:      unitPrice,           // snapshot at time of order
        quantity,
        totalPrice,
      };
    });

    // Check minimum order amount
    if (subtotal < parseFloat(restaurant.minimumOrder)) {
      await transaction.rollback();
      return errorResponse(
        res,
        `Minimum order amount is ₹${restaurant.minimumOrder}. Your cart total is ₹${subtotal.toFixed(2)}`,
        400
      );
    }

    const deliveryFee = parseFloat(restaurant.deliveryFee);
    const taxes       = parseFloat((subtotal * 0.05).toFixed(2)); // 5% GST
    const totalAmount = subtotal + deliveryFee + taxes;

    // ── Step 6: Create the order ──────────────────────────────────────────
    const order = await Order.create({
      orderNumber:     generateOrderNumber(),
      userId:          req.user.id,
      restaurantId,
      addressId,
      status:          'pending',
      subtotal,
      deliveryFee,
      taxes,
      discount:        0,
      totalAmount,
      paymentMethod,
      paymentStatus:   paymentMethod === 'cod' ? 'pending' : 'pending',
      deliveryAddress: {
  addressLine: address.address_line,
  city:        address.city,
  pincode:     address.pincode,
},
      specialInstructions,
    }, { transaction });

    // ── Step 7: Create order items ────────────────────────────────────────
    const orderItems = orderItemsData.map(item => ({
      ...item,
      orderId: order.id,
    }));
    await OrderItem.bulkCreate(orderItems, { transaction });

    // ── Step 8: Commit transaction ────────────────────────────────────────
    await transaction.commit();

    // ── Step 9: Emit real-time event via Socket.io ────────────────────────
    // Restaurant dashboard can listen to 'new_order' event
    const io = req.app.get('io');
    io.emit('new_order', {
      orderId:      order.id,
      orderNumber:  order.orderNumber,
      restaurantId: order.restaurantId,
    });

    // Fetch complete order with items to return in response
    const completeOrder = await Order.findByPk(order.id, {
      include: [{ model: OrderItem, as: 'items' }],
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order:   completeOrder,
    });

  }catch (error) {
  if (!transaction.finished) {
    await transaction.rollback();
  }

  next(error);
}
};

// ── GET /api/orders ───────────────────────────────────────────────────────
// Get logged-in user's order history
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id },
      include: [
        { model: OrderItem,  as: 'items'      },
        { model: Restaurant, as: 'restaurant', attributes: ['id', 'name', 'logo'] },
      ],
      order: [['created_at', 'DESC']], // newest first
    });

    res.status(200).json({
      success: true,
      count:   orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/orders/:id ───────────────────────────────────────────────────
// Get single order details (only the owner can see their order)
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      where: {
        id:     req.params.id,
        userId: req.user.id,   // user can only see their own orders
      },
      include: [
        { model: OrderItem,  as: 'items'      },
        { model: Restaurant, as: 'restaurant', attributes: ['id', 'name', 'logo', 'phone'] },
      ],
    });

    if (!order) {
      return errorResponse(res, 'Order not found', 404);
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// ── PATCH /api/orders/:id/cancel ──────────────────────────────────────────
// User cancels their own order (only allowed if status is 'pending' or 'confirmed')
const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!order) {
      return errorResponse(res, 'Order not found', 404);
    }

    const cancellableStatuses = ['pending', 'confirmed'];
    if (!cancellableStatuses.includes(order.status)) {
      return errorResponse(
        res,
        `Cannot cancel order. Current status is '${order.status}'. You can only cancel pending or confirmed orders.`,
        400
      );
    }

    await order.update({
      status:             'cancelled',
      cancelledAt:        new Date(),
      cancellationReason: req.body.reason || 'Cancelled by user',
    });

    // Notify via socket
    const io = req.app.get('io');
    io.to(`order_${order.id}`).emit('order_status_update', {
      orderId: order.id,
      status:  'cancelled',
    });

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      order,
    });
  } catch (error) {
    next(error);
  }
};

// ── PATCH /api/orders/:id/status ──────────────────────────────────────────
// Restaurant or admin updates order status
// Only accessible with admin/restaurant_owner role (enforced in route)
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const validStatuses = ['confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered'];
    if (!validStatuses.includes(status)) {
      return errorResponse(res, `Invalid status. Valid values: ${validStatuses.join(', ')}`, 400);
    }

    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return errorResponse(res, 'Order not found', 404);
    }

    const updateData = { status };

    // Set deliveredAt timestamp when order is delivered
    if (status === 'delivered') {
      updateData.deliveredAt    = new Date();
      updateData.paymentStatus  = order.paymentMethod === 'cod' ? 'paid' : order.paymentStatus;
    }

    await order.update(updateData);

    // Push real-time update to the user who placed this order
    const io = req.app.get('io');
    io.to(`order_${order.id}`).emit('order_status_update', {
      orderId: order.id,
      status,
    });

    res.status(200).json({
      success: true,
      message: `Order status updated to '${status}'`,
      order,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { placeOrder, getMyOrders, getOrderById, cancelOrder, updateOrderStatus };