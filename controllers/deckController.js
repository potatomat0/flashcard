const Deck = require('../models/Deck');
const Card = require('../models/Card');

// @desc    Tạo một bộ bài mới 
// @route   POST /api/decks
// @access  Private
exports.createDeck = async (req, res) => {
    try {
        const { name, description } = req.body;
        const newDeck = new Deck({
            name,
            description,
            user_id: req.user.id // This comes from our auth middleware
        });
        const savedDeck = await newDeck.save();
        res.status(201).json(savedDeck);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    GET Tất cả bộ bài từ người dùng 
// @route   GET /api/decks
// @access  Private
exports.getDecks = async (req, res) => {
    try {
        const decks = await Deck.find({ user_id: req.user.id });
        res.json(decks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    GET một bộ bài từ người dùng 
// @route   GET /api/decks/:id
// @access  Private
exports.getDeckById = async (req, res) => {
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
};

// @desc    Update một bộ bài 
// @route   PATCH /api/decks/:id
// @access  Private
exports.updateDeck = async (req, res) => {
    try {
        const { name, description } = req.body;
        let deck = await Deck.findById(req.params.id);

        if (!deck) {
            return res.status(404).json({ message: 'Deck not found' });
        }
        if (deck.user_id.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        deck.name = name || deck.name;
        deck.description = description || deck.description;

        const updatedDeck = await deck.save();
        res.json(updatedDeck);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Xóa một bộ bài và các lá bài bên trong 
// @route   DELETE /api/decks/:id
// @access  Private
exports.deleteDeck = async (req, res) => {
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
};

// @desc    Tạo một phiên review  
// @route   POST /api/decks/:id/review-session
// @access  Private
exports.createReviewSession = async (req, res) => {
    try {
        const deck = await Deck.findById(req.params.id);
        if (!deck || deck.user_id.toString() !== req.user.id) {
            return res.status(404).json({ message: 'Deck not found or user not authorized' });
        }

        const { reviewSize = 10 } = req.body; // Default to 10 cards
        const allCards = await Card.find({ deck_id: req.params.id });

        if (allCards.length === 0) {
            return res.status(400).json({ message: 'Cannot start a review on an empty deck.' }); }
        // --- TẠO POOL, MỖI LÁ ĐƯỢC THÊM VÀO FREQUENCY LẦN ---
        let weightedPool = [];
        for (const card of allCards) { for (let i = 0; i < card.frequency; i++) {
                weightedPool.push(card);
            }
        }

        // Xáo trộn bộ bài 
        for (let i = weightedPool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [weightedPool[i], weightedPool[j]] = [weightedPool[j], weightedPool[i]];
        }
        // lấy một phần của pool với kích cỡ bằng reviewSize 
        // Sử dụng Set() để đảm bảo trường hợp reviewSize >= deck.size, mọi thẻ trong deck đều được xuất hiện ít nhất một lần 
        const sessionCards = [...new Set(weightedPool)];
        const finalSession = sessionCards.slice(0, reviewSize);
        res.json(finalSession);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
