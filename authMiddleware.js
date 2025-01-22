const jwt = require('jsonwebtoken');
const User = require('../models/User');
const protect = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            next();
        } catch {
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};
const admin = (req, res, next) => {
    if (req.user && req.user.role === 'Admin') {
        next();
    } else {
        res.status(403).json({ message: 'Admin access required' });
    }
};
const authorizeRole = (role) => {
    return async (req, res, next) => {
        const token = req.header('Authorization')?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'Unauthorized access' });

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id);

            if (user.role !== role) {
                return res.status(403).json({ message: 'Access denied' });
            }

            req.user = user;
            next();
        } catch (error) {
            res.status(401).json({ message: 'Invalid token' });
        }
    };
};
module.exports = { protect, admin, authorizeRole };
