const express = require('express');
const router = express.Router();
const cardController = require('../controllers/cardController');
const auth = require('../middleware/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');

router.get('/:id', auth, asyncHandler(cardController.getCardById));

router.post('/:id/review', auth, asyncHandler(cardController.submitCardReview));

router.patch('/:id', auth, asyncHandler(cardController.updateCard));
router.delete('/:id', auth, asyncHandler(cardController.deleteCard));

module.exports = router;
