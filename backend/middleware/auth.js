const jwt = require('jsonwebtoken');
const JWT_SECRET = 'supersecretkey123';

const verifyToken = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token.replace('Bearer ', ''), JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

const verifyAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.role !== 'Admin') {
            return res.status(403).json({ msg: 'Admin resource. Access denied' });
        }
        next();
    });
};

module.exports = { verifyToken, verifyAdmin };
