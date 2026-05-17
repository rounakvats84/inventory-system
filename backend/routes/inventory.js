const express = require('express');
const router = express.Router();
const { getInventory, updateInventory, createPurchase, getPurchases } = require('../controllers/inventory');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

router.get('/', getInventory);
router.patch('/update', verifyToken, verifyAdmin, updateInventory);
router.post('/purchase', verifyToken, verifyAdmin, createPurchase);
router.get('/purchases', verifyToken, verifyAdmin, getPurchases);

module.exports = router;
