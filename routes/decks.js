const express = require('express');
const router = express.Router();
const deckController = require('../controllers/deckController');
const cardController = require('../controllers/cardController');
const auth = require('../middleware/authMiddleware'); 
const asyncHandler = require('../utils/asyncHandler');

router.post('/', auth, asyncHandler(deckController.createDeck));
router.get('/', auth, asyncHandler(deckController.getDecks));
router.post('/clone/:defaultDeckId', auth, asyncHandler(deckController.cloneDefaultDeck));

router.get('/categories', auth, asyncHandler(deckController.getAllUserDeckCategories));

// Route to add a card from a default deck to a user's deck
router.post('/:deckId/cards/from-default', auth, asyncHandler(cardController.addDefaultCardToDeck));

router.get('/:id', auth, asyncHandler(deckController.getDeckById));
router.get('/:id/categories', auth, asyncHandler(deckController.getDeckCategories));
router.patch('/:id', auth, asyncHandler(deckController.updateDeck));
router.delete('/:id', auth, asyncHandler(deckController.deleteDeck));

router.post('/:id/review-session', auth, asyncHandler(deckController.createReviewSession));


module.exports = router;
