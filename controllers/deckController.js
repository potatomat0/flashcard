const Deck = require('../models/Deck');
const Card = require('../models/Card');
const DefaultDeck = require('../models/DefaultDeck');
const DefaultCard = require('../models/DefaultCard');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Tạo một bộ bài mới 
// @route   POST /api/decks
// @access  Private
exports.createDeck = asyncHandler(async (req, res) => {
    const { name, description, url } = req.body;
    const newDeck = new Deck({
        name,
        description,
        url,
        user_id: req.user.id // This comes from our auth middleware
    });
    const savedDeck = await newDeck.save();
    res.status(201).json(savedDeck);
});

// @desc    GET Tất cả bộ bài từ người dùng 
// @route   GET /api/decks
// @access  Private
exports.getDecks = asyncHandler(async (req, res) => {
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
});

// @desc    GET một bộ bài từ người dùng 
// @route   GET /api/decks/:id
// @access  Private
exports.getDeckById = asyncHandler(async (req, res) => {
    const deck = await Deck.findById(req.params.id);

    if (!deck) {
        return res.status(404).json({ message: 'Deck not found' });
    }
    // Ensure the user owns the deck
    if (deck.user_id.toString() !== req.user.id) {
        return res.status(401).json({ message: 'User not authorized' });
    }
    res.json(deck);
});

// @desc    Get all distinct categories for a deck
// @route   GET /api/decks/:id/categories
// @access  Private
exports.getDeckCategories = asyncHandler(async (req, res) => {
    const { id: deckId } = req.params;

    // 1. Verify deck ownership
    const deck = await Deck.findById(deckId);
    if (!deck || deck.user_id.toString() !== req.user.id) {
        return res.status(404).json({ message: 'Deck not found or user not authorized' });
    }

    // 2. Aggregation pipeline to get categories and their cards
    const categories = await Card.aggregate([
        { $match: { deck_id: deck._id } },
        { $unwind: '$category' },
        { 
            $group: { 
                _id: '$category', 
                cards: { $push: '$$ROOT' } 
            } 
        },
        { $project: { _id: 0, category: '$_id', cards: 1 } },
        { $sort: { category: 1 } } // Optional: sort categories alphabetically
    ]);

    res.json(categories);
});


// @desc    Update một bộ bài 
// @route   PATCH /api/decks/:id
// @access  Private
exports.updateDeck = asyncHandler(async (req, res) => {
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
});

// @desc    Xóa một bộ bài và các lá bài bên trong 
// @route   DELETE /api/decks/:id
// @access  Private
exports.deleteDeck = asyncHandler(async (req, res) => {
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
});

// @desc    Tạo một phiên review  
// @route   POST /api/decks/:id/review-session
// @access  Private
exports.createReviewSession = asyncHandler(async (req, res) => {
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

    // New unique, weighted selection across all methods
    // Helper: build weighted pool (array with repeated entries by frequency)
    let weightedPool = [];
    allCards.forEach(card => {
        const freq = Number.isFinite(card.frequency) && card.frequency > 0 ? card.frequency : 3;
        for (let i = 0; i < freq; i++) weightedPool.push(card);
    });

    // Remove all entries for a given card _id from weightedPool
    const removeFromWeightedPool = (idStr) => {
        weightedPool = weightedPool.filter(c => c._id.toString() !== idStr);
    };

    // Weighted selection without replacement
    const pickUnique = (count, usedIds) => {
        const picked = [];
        const used = new Set(usedIds);
        while (picked.length < count && weightedPool.length > 0) {
            const idx = Math.floor(Math.random() * weightedPool.length);
            const candidate = weightedPool[idx];
            const idStr = candidate._id.toString();
            // Remove the candidate from pool regardless to avoid infinite loop skew
            removeFromWeightedPool(idStr);
            if (used.has(idStr)) continue;
            used.add(idStr);
            picked.push(candidate);
        }
        return picked;
    };

    const response = {};
    const order = Object.entries(requestedMethods)
        .filter(([, v]) => v && v > 0)
        .map(([k, v]) => [k, v])
        .sort((a, b) => b[1] - a[1]); // allocate larger requests first

    const usedIds = new Set();
    for (const [method, size] of order) {
        const methodCards = pickUnique(size, usedIds);
        methodCards.forEach(c => usedIds.add(c._id.toString()));

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
                    options,
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
});

// @desc    Clone a default deck to a personal deck
// @route   POST /api/decks/clone/:defaultDeckId
// @access  Private
exports.cloneDefaultDeck = asyncHandler(async (req, res) => {
    const { defaultDeckId } = req.params;
    const userId = req.user.id;

    // 1. Find the default deck
    const defaultDeck = await DefaultDeck.findById(defaultDeckId);
    if (!defaultDeck) {
        return res.status(404).json({ message: 'Default deck not found' });
    }

    // 2. Create a new personal deck from the default deck's data
    const newDeck = new Deck({
        user_id: userId,
        name: defaultDeck.name,
        description: defaultDeck.description,
        url: defaultDeck.url,
        size: defaultDeck.size // Start with the original size
    });
    await newDeck.save();

    // 3. Find all cards from the default deck
    const defaultCards = await DefaultCard.find({ deck_id: defaultDeckId });

    // 4. Create new personal cards from the default cards
    if (defaultCards.length > 0) {
        const newCards = defaultCards.map(card => ({
            deck_id: newDeck._id,
            name: card.name,
            definition: card.definition,
            word_type: card.word_type,
            url: card.url,
            hint: card.hint,
            example: card.example,
            category: card.category
        }));
        await Card.insertMany(newCards);
    }

    res.status(201).json(newDeck);
});

// @desc    Get all distinct categories for all decks of a user
// @route   GET /api/decks/categories
// @access  Private
exports.getAllUserDeckCategories = asyncHandler(async (req, res) => {
    // 1. Find all decks for the current user
    const userDecks = await Deck.find({ user_id: req.user.id }).select('_id');
    const deckIds = userDecks.map(deck => deck._id);

    // 2. Aggregation pipeline to get categories and their card IDs
    const categories = await Card.aggregate([
        { $match: { deck_id: { $in: deckIds } } },
        { $unwind: '$category' },
        {
            $group: {
                _id: '$category',
                cards: { $push: '$_id' }
            }
        },
        { $project: { _id: 0, category: '$_id', cards: 1 } },
        { $sort: { category: 1 } } // Optional: sort categories alphabetically
    ]);

    res.json(categories);
});
