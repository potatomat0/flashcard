const Card = require('../models/Card');
const DefaultCard = require('../models/DefaultCard');
const Deck = require('../models/Deck');

// @desc    Thêm một hoặc nhiều card vào deck
// @route   POST /api/decks/:deckId/cards
// @access  Private
exports.addCardToDeck = async (req, res) => {
    try {
        const { deckId } = req.params;
        const cardsData = req.body; // Can be a single object or an array of objects

        // Xác thực người dùng sở hữu deck
        const deck = await Deck.findById(deckId);
        if (!deck || deck.user_id.toString() !== req.user.id) {
            return res.status(404).json({ message: 'Deck not found or user not authorized' });
        }

        // Standardize input to be an array
        const cardsArray = Array.isArray(cardsData) ? cardsData : [cardsData];

        if (cardsArray.length === 0) {
            return res.status(400).json({ message: 'Request body must contain at least one card.' });
        }

        // Prepare cards for insertion
        const newCards = cardsArray.map(card => ({
            deck_id: deckId,
            name: card.name,
            definition: card.definition,
            word_type: card.word_type,
            url: card.url,
            hint: card.hint,
            example: card.example,
            category: card.category
        }));

        // Insert cards into the database
        const savedCards = await Card.insertMany(newCards);

        // Atomically update the deck's size
        await Deck.findByIdAndUpdate(deckId, { $inc: { size: savedCards.length } });

        // If only one card was sent, return it as an object, otherwise return the array
        res.status(201).json(savedCards.length === 1 ? savedCards[0] : savedCards);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get tât cả card trong deck 
// @route   GET /api/decks/:deckId/cards
// @access  Private
exports.getCardsInDeck = async (req, res) => {
    try {
        const { deckId } = req.params;
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        const deck = await Deck.findById(deckId);
        if (!deck || deck.user_id.toString() !== req.user.id) {
            return res.status(404).json({ message: 'Deck not found or user not authorized' });
        }

        const totalCards = await Card.countDocuments({ deck_id: deckId });
        const cards = await Card.find({ deck_id: deckId }).skip(skip).limit(limit);

        res.json({
            totalPages: Math.ceil(totalCards / limit),
            currentPage: page,
            totalCards,
            cards
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc  submit card để update tần số xuất hiện 
// @route   POST /api/cards/:id/review
// @access  Private
exports.submitCardReview = async (req, res) => {
    try {
        const { id } = req.params;
        // retrievalLevel có thể là 'easy', 'medium', hoặc 'hard'
        // hintWasShown có thể là true hoặc false 
        const { retrievalLevel, hintWasShown } = req.body;

        let card = await Card.findById(id);
        if (!card) {
            return res.status(404).json({ message: 'Card not found' });
        }
        const deck = await Deck.findById(card.deck_id);
        if (deck.user_id.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized for this card' });
        }
        let currentFreq = card.frequency;
        if (hintWasShown) {
            if (retrievalLevel === 'medium') currentFreq += 1;
            if (retrievalLevel === 'hard') currentFreq += 2;
        } else { // Hint was not shown
            if (retrievalLevel === 'easy') currentFreq -= 1;
            if (retrievalLevel === 'hard') currentFreq += 1;
        }
        card.frequency = Math.max(1, Math.min(5, currentFreq));
        await card.save();
        res.json(card);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update card details
// @route   PATCH /api/cards/:id
// @access  Private
exports.updateCard = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body; 

        let card = await Card.findById(id);
        if (!card) return res.status(404).json({ message: 'Card not found' });
        
        const deck = await Deck.findById(card.deck_id);
        if (deck.user_id.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }
        Object.keys(updates).forEach(key => card[key] = updates[key]);
        const updatedCard = await card.save();
        res.json(updatedCard);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete card
// @route   DELETE /api/cards/:id
// @access  Private
exports.deleteCard = async (req, res) => {
    try {
        const { id } = req.params;
        const card = await Card.findById(id);

        if (!card) return res.status(404).json({ message: 'Card not found' });
        const deck = await Deck.findById(card.deck_id);
        if (deck.user_id.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }
        await card.deleteOne();
        await Deck.findByIdAndUpdate(card.deck_id, { $inc: { size: -1 } });
        res.json({ message: 'Card removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add one or more cards from a default deck to a user's personal deck
// @route   POST /api/decks/:deckId/cards/from-default
// @access  Private
exports.addDefaultCardToDeck = async (req, res) => {
    try {
        const { deckId } = req.params;
        const { defaultCardId, defaultCardIds } = req.body;

        let cardIds = [];
        if (defaultCardIds && Array.isArray(defaultCardIds)) {
            cardIds = defaultCardIds;
        } else if (defaultCardId) {
            cardIds = [defaultCardId];
        }

        if (cardIds.length === 0) {
            return res.status(400).json({ message: 'Request body must contain either defaultCardId or defaultCardIds.' });
        }

        // 1. Find the user's deck and verify ownership
        const deck = await Deck.findById(deckId);
        if (!deck || deck.user_id.toString() !== req.user.id) {
            return res.status(404).json({ message: 'Deck not found or user not authorized' });
        }

        // 2. Find all the default cards to copy in a single query
        const defaultCards = await DefaultCard.find({ '_id': { $in: cardIds } });
        if (defaultCards.length !== cardIds.length) {
            return res.status(404).json({ message: 'One or more default cards were not found.' });
        }

        // 3. Create new cards by copying the default cards' data
        const newCards = defaultCards.map(defaultCard => ({
            deck_id: deckId,
            name: defaultCard.name,
            definition: defaultCard.definition,
            word_type: defaultCard.word_type,
            url: defaultCard.url,
            hint: defaultCard.hint,
            example: defaultCard.example,
            category: defaultCard.category,
            // frequency is left to its default value
        }));

        // 4. Insert all new cards into the database
        const savedCards = await Card.insertMany(newCards);

        // 5. Atomically update the deck's size
        await Deck.findByIdAndUpdate(deckId, { $inc: { size: savedCards.length } });

        // If only one card was sent, return it as an object, otherwise return the array
        res.status(201).json(savedCards.length === 1 ? savedCards[0] : savedCards);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
