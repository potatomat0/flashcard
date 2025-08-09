const express = require('express');

const router = express.Router({ mergeParams: true }); 
const cardController = require('../controllers/cardController');
const auth = require('../middleware/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');

router.post('/', auth, asyncHandler(cardController.addCardToDeck));
router.get('/', auth, asyncHandler(cardController.getCardsInDeck));

module.exports = router;
