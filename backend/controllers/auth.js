const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');
const Admin = require('../models/Admin');

const JWT_SECRET = 'supersecretkey123';

const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        
        let Model = role === 'Admin' ? Admin : Customer;

        const existingUser = await Model.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await Model.create({
            name,
            email,
            password: hashedPassword
        });

        const assignedRole = role === 'Admin' ? 'Admin' : 'Customer';

        const payload = {
            user: {
                id: user._id,
                role: assignedRole
            }
        };

        jwt.sign(payload, JWT_SECRET, { expiresIn: '5 days' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { id: user._id, name, role: assignedRole } });
        });
    } catch (err) {
        console.error("Register Error:", err);
        res.status(500).json({ msg: err.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        let user;
        let assignedRole = role;

        if (role === 'Admin') {
            user = await Admin.findOne({ email });
            assignedRole = 'Admin';
        } else if (role === 'Customer') {
            user = await Customer.findOne({ email });
            assignedRole = 'Customer';
        } else {
            // try both
            user = await Admin.findOne({ email });
            if (user) assignedRole = 'Admin';
            else {
                user = await Customer.findOne({ email });
                assignedRole = 'Customer';
            }
        }

        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const payload = {
            user: {
                id: user._id,
                role: assignedRole
            }
        };

        jwt.sign(payload, JWT_SECRET, { expiresIn: '5 days' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { id: user._id, name: user.name, role: assignedRole } });
        });
    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ msg: err.message });
    }
};

module.exports = { register, login };
