const express = require('express');
const router  = express.Router();

const {
  placeOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  updateOrderStatus,
} = require('../controllers/orderController');

const { authMiddleware } = require('../middlewares/authMiddileware');

// All order routes require login
router.use(authMiddleware);

// POST /api/orders  — place a new order
router.post('/', placeOrder);

// GET /api/orders  — my order history
router.get('/', getMyOrders);

// GET /api/orders/:id  — single order details
router.get('/:id', getOrderById);

// PATCH /api/orders/:id/cancel  — user cancels their order
router.patch('/:id/cancel', cancelOrder);

// PATCH /api/orders/:id/status  — restaurant/admin updates status
router.patch('/:id/status', updateOrderStatus);

module.exports = router;