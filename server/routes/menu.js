const express = require('express');
const router  = express.Router();

const { getMenuItemById } = require('../controllers/menuController');

// GET /api/menu/:id
router.get('/:id', getMenuItemById);

module.exports = router;