const Card = require('../models/Card');
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
            hint: card.hint,
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
        const deck = await Deck.findById(deckId);
        if (!deck || deck.user_id.toString() !== req.user.id) {
            return res.status(404).json({ message: 'Deck not found or user not authorized' });
        }
        const cards = await Card.find({ deck_id: deckId });
        res.json(cards);
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
