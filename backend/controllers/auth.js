const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'supersecretkey123'; // Hardcoded for simplicity during dev

const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        
        const [existingUsers] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const assignedRole = role || 'Customer';

        const [insertRes] = await pool.execute(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, assignedRole]
        );

        const userId = insertRes.insertId;

        const payload = {
            user: {
                id: userId,
                role: assignedRole
            }
        };

        jwt.sign(payload, JWT_SECRET, { expiresIn: '5 days' }, (err, token) => {
            if (err) {
                console.error("JWT Error:", err);
                return res.status(500).json({ msg: "Error generating token." });
            }
            res.json({ token, user: { id: userId, name, role: assignedRole } });
        });
    } catch (err) {
        console.error("Register Error:", err);
        res.status(500).json({ msg: err.message, stack: err.stack });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const user = users[0];

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(payload, JWT_SECRET, { expiresIn: '5 days' }, (err, token) => {
            if (err) {
                console.error("JWT Error:", err);
                return res.status(500).json({ msg: "Error generating token." });
            }
            res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
        });
    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ msg: err.message, stack: err.stack });
    }
};

module.exports = { register, login };
