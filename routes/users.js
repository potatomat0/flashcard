const express = require('express');
const router = express.Router();
// Explicitly require the .js file to avoid resolving the legacy file without extension
const userController = require('../controllers/userController.js');
const asyncHandler = require('../utils/asyncHandler');
const auth = require('../middleware/authMiddleware');
const { validateRegistration } = require('../middleware/validationMiddleware');

router.post('/register', validateRegistration, asyncHandler(userController.register));
router.post('/login', asyncHandler(userController.login));

router.get('/profile', auth, userController.getUserProfile);
router.patch('/profile', auth, asyncHandler(userController.updateUserProfile));
router.delete('/profile', auth, asyncHandler(userController.deleteUser));

module.exports = router;
