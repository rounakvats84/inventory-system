const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { verifyToken } = require('../middleware/auth');

// I'll put the cart logic directly in here for now
router.get('/', verifyToken, async (req, res) => {
    try {
        const customerId = req.user.id;
        let cart = await Cart.findOne({ customer: customerId }).populate('items.product');
        if (!cart) {
            cart = await Cart.create({ customer: customerId, items: [], total_amount: 0 });
        }
        res.json(cart);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/add', verifyToken, async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const customerId = req.user.id;
        
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ msg: 'Product not found' });

        let cart = await Cart.findOne({ customer: customerId });
        if (!cart) {
            cart = new Cart({ customer: customerId, items: [], total_amount: 0 });
        }

        const existingItemIndex = cart.items.findIndex(item => item.product.toString() === productId);
        if (existingItemIndex > -1) {
            cart.items[existingItemIndex].quantity += quantity;
            cart.items[existingItemIndex].price = product.selling_price * cart.items[existingItemIndex].quantity;
        } else {
            cart.items.push({
                product: productId,
                quantity,
                price: product.selling_price * quantity
            });
        }

        cart.total_amount = cart.items.reduce((total, item) => total + item.price, 0);
        await cart.save();
        
        // populate before returning
        await cart.populate('items.product');
        res.json(cart);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/update', verifyToken, async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const customerId = req.user.id;

        let cart = await Cart.findOne({ customer: customerId });
        if (!cart) return res.status(404).json({ msg: 'Cart not found' });

        const existingItemIndex = cart.items.findIndex(item => item.product.toString() === productId);
        if (existingItemIndex > -1) {
            if (quantity <= 0) {
                cart.items.splice(existingItemIndex, 1);
            } else {
                const product = await Product.findById(productId);
                cart.items[existingItemIndex].quantity = quantity;
                cart.items[existingItemIndex].price = product.selling_price * quantity;
            }
        }

        cart.total_amount = cart.items.reduce((total, item) => total + item.price, 0);
        await cart.save();
        await cart.populate('items.product');
        res.json(cart);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/remove', verifyToken, async (req, res) => {
    try {
        const { productId } = req.body;
        const customerId = req.user.id;

        let cart = await Cart.findOne({ customer: customerId });
        if (!cart) return res.status(404).json({ msg: 'Cart not found' });

        cart.items = cart.items.filter(item => item.product.toString() !== productId);
        cart.total_amount = cart.items.reduce((total, item) => total + item.price, 0);
        
        await cart.save();
        await cart.populate('items.product');
        res.json(cart);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/clear', verifyToken, async (req, res) => {
    try {
        const customerId = req.user.id;
        let cart = await Cart.findOne({ customer: customerId });
        if (cart) {
            cart.items = [];
            cart.total_amount = 0;
            await cart.save();
        }
        res.json(cart);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
