const express = require('express');
const router  = express.Router();
const {
  getAllRestaurants,
  getRestaurantById,
  getRestaurantMenu,
} = require('../controllers/restaurantController');

// GET /api/restaurants?city=Hyderabad&category=Biryani&search=paradise
router.get('/', getAllRestaurants);

// GET /api/restaurants/:id
router.get('/:id', getRestaurantById);

// GET /api/restaurants/:id/menu
router.get('/:id/menu', getRestaurantMenu);

module.exports = router;