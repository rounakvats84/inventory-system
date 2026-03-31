const express = require('express');
const router = express.Router();
const { getInventory, updateInventory } = require('../controllers/inventory');

router.get('/', getInventory);
router.patch('/update', updateInventory);

module.exports = router;
