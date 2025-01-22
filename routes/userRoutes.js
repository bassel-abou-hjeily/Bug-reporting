const express = require('express');
const {
    getUserProfile,
    updateUserProfile,
    getAllUsers,
    updateUserRole,
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');
const router = express.Router();
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.get('/', protect, admin, getAllUsers);
router.put('/:id/role', protect, admin, updateUserRole);
module.exports = router;
