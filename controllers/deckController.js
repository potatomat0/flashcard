const Deck = require('../models/Deck');
const Card = require('../models/Card');

const asyncHandler = require('../utils/asyncHandler');

// @desc    Tạo một bộ bài mới 
// @route   POST /api/decks
// @access  Private
exports.createDeck = asyncHandler(async (req, res) => {
    try {
        const { name, description, url } = req.body;
        const newDeck = new Deck({
            name,
            description,
            url,
            user_id: req.user.id // This comes from our auth middleware
        });
        const savedDeck = await newDeck.save();
        res.status(201).json(savedDeck);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    GET Tất cả bộ bài từ người dùng 
// @route   GET /api/decks
// @access  Private
exports.getDecks = asyncHandler(async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        const totalDecks = await Deck.countDocuments({ user_id: req.user.id });
        const decks = await Deck.find({ user_id: req.user.id }).skip(skip).limit(limit);

        res.json({
            totalPages: Math.ceil(totalDecks / limit),
            currentPage: page,
            totalDecks,
            decks
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    GET một bộ bài từ người dùng 
// @route   GET /api/decks/:id
// @access  Private
exports.getDeckById = asyncHandler(async (req, res) => {
    try {
        const deck = await Deck.findById(req.params.id);

        if (!deck) {
            return res.status(404).json({ message: 'Deck not found' });
        }
        // Ensure the user owns the deck
        if (deck.user_id.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }
        res.json(deck);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Update một bộ bài 
// @route   PATCH /api/decks/:id
// @access  Private
exports.updateDeck = asyncHandler(async (req, res) => {
    try {
        const { name, description, url } = req.body;
        let deck = await Deck.findById(req.params.id);

        if (!deck) {
            return res.status(404).json({ message: 'Deck not found' });
        }
        if (deck.user_id.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        deck.name = name || deck.name;
        deck.description = description || deck.description;
        deck.url = url || deck.url;

        const updatedDeck = await deck.save();
        res.json(updatedDeck);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Xóa một bộ bài và các lá bài bên trong 
// @route   DELETE /api/decks/:id
// @access  Private
exports.deleteDeck = asyncHandler(async (req, res) => {
    try {
        const deck = await Deck.findById(req.params.id);

        if (!deck) {
            return res.status(404).json({ message: 'Deck not found' });
        }
        if (deck.user_id.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

	// xóa bài trước, sau đó mới xóa bộ bài
        await Card.deleteMany({ deck_id: req.params.id });

        await deck.deleteOne();

        res.json({ message: 'Deck and associated cards removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Tạo một phiên review  
// @route   POST /api/decks/:id/review-session
// @access  Private
exports.createReviewSession = asyncHandler(async (req, res) => {
    try {
        const { id: deckId } = req.params;
        const deck = await Deck.findById(deckId);
        if (!deck || deck.user_id.toString() !== req.user.id) {
            return res.status(404).json({ message: 'Deck not found or user not authorized' });
        }

        const allCards = await Card.find({ deck_id: deckId });
        const deckSize = allCards.length;

        if (deckSize === 0) {
            return res.status(400).json({ message: 'Cannot start a review on an empty deck.' });
        }

        let requestedMethods = req.body;

        // If the request body is empty, apply default flashcard review logic
        if (Object.keys(requestedMethods).length === 0) {
            requestedMethods = { flashcard: Math.min(deckSize, 10) };
        }

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

        // 1. Create the session pool based on the largest requested method size
        let sessionPool = [];
        if (largestMethodSize >= deckSize) {
            // If requested size is larger than deck, include all cards at least once
            sessionPool = [...allCards]; // Add all unique cards
            const remainingSlots = largestMethodSize - deckSize;
            if (remainingSlots > 0) {
                // Create a weighted pool for the remaining slots
                let weightedPool = [];
                allCards.forEach(card => {
                    for (let i = 0; i < (card.frequency || 3); i++) weightedPool.push(card);
                });
                // Fill remaining slots with weighted random cards
                for (let i = 0; i < remainingSlots; i++) {
                    const randomIndex = Math.floor(Math.random() * weightedPool.length);
                    sessionPool.push(weightedPool[randomIndex]);
                }
            }
        } else {
            // If requested size is smaller than deck, use weighted selection for all slots
            let weightedPool = [];
            allCards.forEach(card => {
                for (let i = 0; i < (card.frequency || 3); i++) weightedPool.push(card);
            });
            // Shuffle to randomize
            for (let i = weightedPool.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [weightedPool[i], weightedPool[j]] = [weightedPool[j], weightedPool[i]];
            }
            sessionPool = [...new Set(weightedPool)].slice(0, largestMethodSize);
        }

        // 2. Build the response by drawing from the shared session pool
        const response = {};
        for (const method in requestedMethods) {
            const count = requestedMethods[method];
            if (count === 0) continue;

            // Shuffle the pool and take the required number of cards for the current method
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
            } else if (method === 'fillInTheBlank') {
                response.fillInTheBlank = methodCards.map(card => {
                    const showName = Math.random() > 0.5;
                    return {
                        card_id: card._id,
                        prompt: showName ? card.name : card.definition,
                        correctAnswer: showName ? card.definition : card.name
                    };
                });
            }
        }

        res.json(response);
    } catch (error) {
        console.error('Error creating review session:', error);
        res.status(500).json({ message: 'An unexpected error occurred.' });
    }
});
