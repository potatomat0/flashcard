const express = require('express');
const router = express.Router();
const defaultDeckController = require('../controllers/defaultDeckController');
const asyncHandler = require('../utils/asyncHandler');

// Public routes, no authentication required

router.get('/', asyncHandler(defaultDeckController.getDefaultDecks));

router.get('/:id', asyncHandler(defaultDeckController.getDefaultDeckById));

router.get('/:deckId/cards', asyncHandler(defaultDeckController.getCardsInDefaultDeck));

router.post('/:id/review-session', asyncHandler(defaultDeckController.createReviewSessionForDefaultDeck));

module.exports = router;
