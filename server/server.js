require('dotenv').config();
const express      = require('express');
const http         = require('http');
const { Server }   = require('socket.io');
const cors         = require('cors');
const helmet       = require('helmet');
const morgan       = require('morgan');
const rateLimit    = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const path         = require('path');

const config                   = require('./config');
const { connectDB, sequelize } = require('./config/database');
const logger                   = require('./utils/logger');
const { errorHandler, notFound } = require('./middlewares/errorHandler');
const { User, Restaurant, Address, MenuItem, Order, OrderItem, Review } = require('./models');

// ── Routes ────────────────────────────────
const authRoutes       = require('./routes/auth');
const restaurantRoutes = require('./routes/restaurant');
const menuRoutes       = require('./routes/menu');
const orderRoutes      = require('./routes/order'); // NEW

const app    = express();
const server = http.createServer(app);

// ── Socket.io ─────────────────────────────
const io = new Server(server, {
  cors: { origin: config.server.clientUrl, methods: ['GET', 'POST'] },
});
app.set('io', io);
io.on('connection', (socket) => {
  logger.info(`Socket connected: ${socket.id}`);
  socket.on('join_order_room', (orderId) => {
    socket.join(`order_${orderId}`);
    logger.info(`Socket ${socket.id} joined room: order_${orderId}`);
  });
  socket.on('disconnect', () => logger.info(`Socket disconnected: ${socket.id}`));
});

// ── Middlewares ───────────────────────────
app.use(helmet());
app.use(cors({ origin: config.server.clientUrl, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Rate Limiting ─────────────────────────
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: 'Too many requests, please try again later.' },
}));

// ── Health Check ──────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', environment: config.server.nodeEnv, timestamp: new Date().toISOString() });
});

// ── API Routes ────────────────────────────
app.use('/api/auth',        authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/menu',        menuRoutes);
app.use('/api/orders',      orderRoutes); // NEW

// app.use('/api/payments', require('./routes/payment'));

app.get('/api', (req, res) => {
  res.json({ success: true, message: '🍔 FoodApp API is running!', version: '1.0.0' });
});

// ── Error Handlers ────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start Server ──────────────────────────
const startServer = async () => {
  await connectDB();

  if (config.server.nodeEnv === 'development') {
    await User.sync({ alter: true });
    await Address.sync({ alter: true });
    await Restaurant.sync({ alter: true });
    await MenuItem.sync({ alter: true });
    await Order.sync({ alter: true });
    await OrderItem.sync({ alter: true });
    await Review.sync({ alter: true });
    logger.info('✅ All database models synced');
  }

  server.listen(config.server.port, () => {
    logger.info(`🚀 Server running on http://localhost:${config.server.port}`);
    logger.info(`📊 Environment: ${config.server.nodeEnv}`);
  });
};

startServer().catch((err) => {
  logger.error('Failed to start server:', err);
  process.exit(1);
});

module.exports = { app, io };