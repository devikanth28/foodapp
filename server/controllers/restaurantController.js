const { Op, literal, fn, col } = require('sequelize');
const { sequelize } = require('../config/database');
const { Restaurant, MenuItem } = require('../models');
const { errorResponse } = require('../utils/apiResponse');

// ── Haversine Formula ─────────────────────────────────────────────────────
// Calculates straight-line distance (in km) between two GPS coordinates
// This is the same math Swiggy/Zomato use to find nearby restaurants
//
//  lat1, lng1 = user's location
//  lat2, lng2 = restaurant's location (from DB columns)
//
// Returns a Sequelize literal so it runs inside the SQL query itself
const distanceFormula = (lat, lng) => literal(`
  (6371 * acos(
    cos(radians(${lat}))
    * cos(radians(latitude))
    * cos(radians(longitude) - radians(${lng}))
    + sin(radians(${lat}))
    * sin(radians(latitude))
  ))
`);

// ── GET /api/restaurants ──────────────────────────────────────────────────
// Supports two modes:
//   1. Location mode: ?lat=17.385&lng=78.486&radius=10
//      → returns restaurants within 10km, sorted by nearest first
//   2. Normal mode:  ?city=Hyderabad&category=Biryani&search=paradise
//      → returns filtered list sorted by rating
const getAllRestaurants = async (req, res, next) => {
  try {
    const { city, category, search, isOpen, lat, lng, radius = 10 } = req.query;

    const where = { isActive: true };

    if (city)     where.city     = city;
    if (category) where.category = category;
    if (isOpen !== undefined) where.isOpen = isOpen === 'true';
    if (search) {
      where[Op.or] = [
        { name:     { [Op.like]: `%${search}%` } },
        { category: { [Op.like]: `%${search}%` } },
      ];
    }

    // ── Location-based mode ───────────────────────────────────────────────
    if (lat && lng) {
      const parsedLat    = parseFloat(lat);
      const parsedLng    = parseFloat(lng);
      const parsedRadius = parseFloat(radius);

      // Validate coordinates
      if (
        isNaN(parsedLat) || isNaN(parsedLng) ||
        parsedLat < -90   || parsedLat > 90  ||
        parsedLng < -180  || parsedLng > 180
      ) {
        return errorResponse(res, 'Invalid latitude or longitude values', 400);
      }

      const distance = distanceFormula(parsedLat, parsedLng);

      const restaurants = await Restaurant.findAll({
        where,
        attributes: [
          'id', 'name', 'description', 'category', 'cuisine',
          'rating', 'totalRatings', 'deliveryTime', 'deliveryFee',
          'minimumOrder', 'coverImage', 'logo', 'isOpen', 'city',
          'latitude', 'longitude',
          // Calculate distance and include it in each result as 'distance_km'
          [distance, 'distance_km'],
        ],
        // HAVING filters on calculated columns (distance isn't a real column)
        // We can't use WHERE for distance_km, must use HAVING
        having: literal(`distance_km <= ${parsedRadius}`),
        order: [
          // Nearest first, then by rating for tie-breaking
          [literal('distance_km'), 'ASC'],
          ['rating', 'DESC'],
        ],
      });

      return res.status(200).json({
        success: true,
        count:  restaurants.length,
        mode:   'location',
        center: { lat: parsedLat, lng: parsedLng },
        radius: `${parsedRadius} km`,
        restaurants,
      });
    }

    // ── Normal mode (no coordinates given) ───────────────────────────────
    const restaurants = await Restaurant.findAll({
      where,
      attributes: [
        'id', 'name', 'description', 'category', 'cuisine',
        'rating', 'totalRatings', 'deliveryTime', 'deliveryFee',
        'minimumOrder', 'coverImage', 'logo', 'isOpen', 'city',
      ],
      order: [
        ['rating', 'DESC'],
        ['name',   'ASC'],
      ],
    });

    res.status(200).json({
      success: true,
      count: restaurants.length,
      mode:  'normal',
      restaurants,
    });

  } catch (error) {
    next(error);
  }
};

// ── GET /api/restaurants/:id ──────────────────────────────────────────────
const getRestaurantById = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({
      where: { id: req.params.id, isActive: true },
    });

    if (!restaurant) {
      return errorResponse(res, 'Restaurant not found', 404);
    }

    res.status(200).json({ success: true, restaurant });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/restaurants/:id/menu ─────────────────────────────────────────
const getRestaurantMenu = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findByPk(req.params.id);
    if (!restaurant) {
      return errorResponse(res, 'Restaurant not found', 404);
    }

    const menuItems = await MenuItem.findAll({
      where:  { restaurantId: req.params.id, isAvailable: true },
      order: [['category', 'ASC'], ['sortOrder', 'ASC'], ['name', 'ASC']],
    });

    // Group by category: { "Starters": [...], "Main Course": [...] }
    const menu = menuItems.reduce((grouped, item) => {
      if (!grouped[item.category]) grouped[item.category] = [];
      grouped[item.category].push(item);
      return grouped;
    }, {});

    res.status(200).json({
      success:      true,
      restaurantId: req.params.id,
      menu,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllRestaurants, getRestaurantById, getRestaurantMenu };