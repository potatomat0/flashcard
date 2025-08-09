const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const asyncHandler = require('../utils/asyncHandler');
const auth = require('../middleware/authMiddleware');

router.post('/register', asyncHandler(userController.register));
router.post('/login', asyncHandler(userController.login));

router.patch('/profile', auth, asyncHandler(userController.updateUserProfile));
router.delete('/profile', auth, asyncHandler(userController.deleteUser));

module.exports = router;
