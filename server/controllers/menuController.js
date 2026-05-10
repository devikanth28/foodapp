const { MenuItem, Restaurant } = require('../models');
const { errorResponse } = require('../utils/apiResponse');

// ── GET /api/menu/:id ─────────────────────────────────────────────────────
// Get a single menu item by its id
const getMenuItemById = async (req, res, next) => {
  try {
    const item = await MenuItem.findOne({
      where: {
        id:          req.params.id,
        isAvailable: true,
      },
      // Also include basic restaurant info so frontend knows which restaurant this belongs to
      include: [{
        model:      Restaurant,
        as:         'restaurant',
        attributes: ['id', 'name', 'deliveryTime', 'deliveryFee'],
      }],
    });

    if (!item) {
      return errorResponse(res, 'Menu item not found', 404);
    }

    res.status(200).json({
      success: true,
      item,
    });

  } catch (error) {
    next(error);
  }
};

module.exports = { getMenuItemById };