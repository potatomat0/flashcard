const express = require('express');
const router = express.Router();
const deckController = require('../controllers/deckController');
const auth = require('../middleware/authMiddleware'); 
const asyncHandler = require('../utils/asyncHandler');

router.post('/', auth, asyncHandler(deckController.createDeck));
router.get('/', auth, asyncHandler(deckController.getDecks));

router.get('/:id', auth, asyncHandler(deckController.getDeckById));
router.patch('/:id', auth, asyncHandler(deckController.updateDeck));
router.delete('/:id', auth, asyncHandler(deckController.deleteDeck));

router.post('/:id/review-session', auth, asyncHandler(deckController.createReviewSession));

module.exports = router;
