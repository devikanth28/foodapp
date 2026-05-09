/**
 * Seed script — populates DB with sample restaurants and menu items
 * Run with: npm run seed
 */

require('dotenv').config();
const { sequelize } = require('../config/database');
const { Restaurant, MenuItem } = require('../models');
const logger = require('./logger');

const restaurants = [
  {
    name: 'Spice Garden',
    description: 'Authentic Hyderabadi biryani and curries',
    phone: '+919876543210',
    address: '12 Jubilee Hills, Hyderabad',
    city: 'Hyderabad',
    latitude: 17.4326,
    longitude: 78.4071,
    category: 'Biryani',
    cuisine: ['Hyderabadi', 'Mughlai'],
    rating: 4.5,
    totalRatings: 1250,
    deliveryTime: 35,
    deliveryFee: 30,
    minimumOrder: 199,
    isOpen: true,
    openingTime: '10:00:00',
    closingTime: '23:00:00',
  },
  {
    name: 'Pizza Planet',
    description: 'Wood-fired pizzas and loaded garlic breads',
    phone: '+919876543211',
    address: '45 Banjara Hills, Hyderabad',
    city: 'Hyderabad',
    latitude: 17.4156,
    longitude: 78.4347,
    category: 'Pizza',
    cuisine: ['Italian', 'Continental'],
    rating: 4.2,
    totalRatings: 890,
    deliveryTime: 25,
    deliveryFee: 40,
    minimumOrder: 299,
    isOpen: true,
    openingTime: '11:00:00',
    closingTime: '23:30:00',
  },
];

const menuItems = [
  // Spice Garden menu
  {
    restaurantIndex: 0,
    items: [
      { name: 'Chicken Dum Biryani', description: 'Slow-cooked with whole spices', price: 280, category: 'Biryani', isVeg: false, isBestseller: true },
      { name: 'Mutton Biryani', description: 'Tender mutton on a bed of basmati', price: 350, category: 'Biryani', isVeg: false },
      { name: 'Veg Biryani', description: 'Garden fresh vegetables with saffron rice', price: 220, category: 'Biryani', isVeg: true },
      { name: 'Chicken 65', description: 'Crispy spiced chicken', price: 220, category: 'Starters', isVeg: false, isBestseller: true },
      { name: 'Paneer Tikka', description: 'Marinated cottage cheese on grill', price: 240, category: 'Starters', isVeg: true },
      { name: 'Raita', description: 'Cooling yogurt with cucumber', price: 60, category: 'Sides', isVeg: true },
    ],
  },
  // Pizza Planet menu
  {
    restaurantIndex: 1,
    items: [
      { name: 'Margherita', description: 'Classic tomato, mozzarella, basil', price: 299, category: 'Veg Pizzas', isVeg: true },
      { name: 'Pepperoni', description: 'Loaded with spicy pepperoni', price: 399, category: 'Non-Veg Pizzas', isVeg: false, isBestseller: true },
      { name: 'Garlic Bread', description: 'Crispy with herb butter', price: 149, category: 'Sides', isVeg: true, isBestseller: true },
      { name: 'Cold Coffee', description: 'House blended iced coffee', price: 120, category: 'Drinks', isVeg: true },
    ],
  },
];

const seed = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    logger.info('DB connected. Starting seed...');

    // Clear existing data
    await MenuItem.destroy({ where: {} });
    await Restaurant.destroy({ where: {} });

    // Insert restaurants
    const createdRestaurants = await Restaurant.bulkCreate(restaurants);
    logger.info(`Created ${createdRestaurants.length} restaurants`);

    // Insert menu items
    for (const group of menuItems) {
      const restaurant = createdRestaurants[group.restaurantIndex];
      const items = group.items.map((item) => ({
        ...item,
        restaurantId: restaurant.id,
      }));
      await MenuItem.bulkCreate(items);
      logger.info(`Created ${items.length} items for ${restaurant.name}`);
    }

    logger.info('✅ Seed complete!');
    process.exit(0);
  } catch (error) {
    logger.error('Seed failed:', error);
    process.exit(1);
  }
};

seed();
