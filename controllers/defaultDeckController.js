const DefaultDeck = require('../models/DefaultDeck');
const DefaultCard = require('../models/DefaultCard');

// @desc    Get all default decks
// @route   GET /api/default-decks
// @access  Public
exports.getDefaultDecks = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        const totalDecks = await DefaultDeck.countDocuments();
        const decks = await DefaultDeck.find().skip(skip).limit(limit);

        res.json({
            totalPages: Math.ceil(totalDecks / limit),
            currentPage: page,
            totalDecks: totalDecks,
            decks
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get a single default deck by ID
// @route   GET /api/default-decks/:id
// @access  Public
exports.getDefaultDeckById = async (req, res) => {
    try {
        const deck = await DefaultDeck.findById(req.params.id);
        if (!deck) {
            return res.status(404).json({ message: 'Default deck not found' });
        }
        res.json(deck);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all cards in a default deck
// @route   GET /api/default-decks/:deckId/cards
// @access  Public
exports.getCardsInDefaultDeck = async (req, res) => {
    try {
        const { deckId } = req.params;
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        const deck = await DefaultDeck.findById(deckId);
        if (!deck) {
            return res.status(404).json({ message: 'Default deck not found' });
        }

        const totalCards = await DefaultCard.countDocuments({ deck_id: deckId });
        const cards = await DefaultCard.find({ deck_id: deckId }).skip(skip).limit(limit);

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

// @desc    Create a review session for a default deck
// @route   POST /api/default-decks/:id/review-session
// @access  Public
exports.createReviewSessionForDefaultDeck = async (req, res) => {
    try {
        const { id: deckId } = req.params;
        const deck = await DefaultDeck.findById(deckId);
        if (!deck) {
            return res.status(404).json({ message: 'Default deck not found' });
        }

        const allCards = await DefaultCard.find({ deck_id: deckId });
        const deckSize = allCards.length;

        if (deckSize === 0) {
            return res.status(400).json({ message: 'Cannot start a review on an empty deck.' });
        }

        let requestedMethods = req.body;
        if (Object.keys(requestedMethods).length === 0) {
            requestedMethods = { flashcard: Math.min(deckSize, 10) };
        }

        // This logic is duplicated from deckController. It could be refactored into a shared utility if needed.
        const validMethods = ['flashcard', 'mcq', 'fillInTheBlank'];
        let largestMethodSize = 0;
        for (const method in requestedMethods) {
            if (!validMethods.includes(method) || !Number.isInteger(requestedMethods[method]) || requestedMethods[method] < 0) {
                return res.status(400).json({ message: `Invalid method or size for: ${method}` });
            }
            if (requestedMethods[method] > largestMethodSize) {
                largestMethodSize = requestedMethods[method];
            }
        }

        if (largestMethodSize === 0) {
            return res.status(400).json({ message: 'Review session must have at least one card.' });
        }
        if (requestedMethods.mcq && deckSize < 4) {
            return res.status(400).json({ message: 'MCQ method requires at least 4 cards in the deck to generate distractors.' });
        }

        let sessionPool = [];
        if (largestMethodSize >= deckSize) {
            sessionPool = [...allCards];
            const remainingSlots = largestMethodSize - deckSize;
            if (remainingSlots > 0) {
                let weightedPool = [];
                allCards.forEach(card => {
                    for (let i = 0; i < (card.frequency || 3); i++) weightedPool.push(card);
                });
                for (let i = 0; i < remainingSlots; i++) {
                    const randomIndex = Math.floor(Math.random() * weightedPool.length);
                    sessionPool.push(weightedPool[randomIndex]);
                }
            }
        } else {
            let weightedPool = [];
            allCards.forEach(card => {
                for (let i = 0; i < (card.frequency || 3); i++) weightedPool.push(card);
            });
            for (let i = weightedPool.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [weightedPool[i], weightedPool[j]] = [weightedPool[j], weightedPool[i]];
            }
            sessionPool = [...new Set(weightedPool)].slice(0, largestMethodSize);
        }

        const response = {};
        for (const method in requestedMethods) {
            const count = requestedMethods[method];
            if (count === 0) continue;

            const methodCards = [...sessionPool].sort(() => 0.5 - Math.random()).slice(0, count);

            if (method === 'flashcard') {
                response.flashcard = methodCards;
            } else if (method === 'mcq') {
                response.mcq = methodCards.map(card => {
                    const distractors = allCards
                        .filter(c => c._id.toString() !== card._id.toString())
                        .sort(() => 0.5 - Math.random())
                        .slice(0, 3)
                        .map(c => c.definition);
                    const options = [card.definition, ...distractors].sort(() => 0.5 - Math.random());
                    return {
                        card_id: card._id,
                        prompt: card.name,
                        options: options,
                        correctAnswer: card.definition
                    };
                });
            }
        }

        res.json(response);
    } catch (error) {
        console.error('Error creating review session:', error);
        res.status(500).json({ message: 'An unexpected error occurred.' });
    }
};
