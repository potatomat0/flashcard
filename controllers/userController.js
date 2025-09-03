const User = require('../models/User');
const Deck = require('../models/Deck');
const Card = require('../models/Card');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const { username, name, email, password } = req.body;

        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ message: 'Username or email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = new User({
            username,
            name,
            email,
            passwordHash,
        });

        const savedUser = await newUser.save();

        // Create a default deck for the new user
        const defaultDeck = new Deck({
            name: `${savedUser.username}'s first deck`,
            description: 'A place to save new cards you discover.',
            user_id: savedUser._id
        });
        await defaultDeck.save();

        res.status(201).json({
            _id: savedUser._id,
            username: savedUser.username,
            name: savedUser.name,
            email: savedUser.email,
            createdAt: savedUser.createdAt,
            updatedAt: savedUser.updatedAt
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const payload = {
            id: user._id,
            name: user.username
        };

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                name: user.name
            }
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Lấy thông tin user hiện tại
// @route   GET /api/users/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            _id: user._id,
            username: user.username,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Cập nhật user profile 
// @route   PATCH /api/users/profile
// @access  Private
exports.updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (user) {
            user.name = req.body.name || user.name;
            if (req.body.email && req.body.email !== user.email) {
                const existingUser = await User.findOne({ email: req.body.email });
                if (existingUser) {
                    return res.status(400).json({ message: 'Email already in use' });
                }
                user.email = req.body.email;
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                username: updatedUser.username,
                name: updatedUser.name,
                email: updatedUser.email,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Xóa user
// @route   DELETE /api/users/profile
// @access  Private
exports.deleteUser = async (req, res) => {
    try {
        const userId = req.user.id;
        // tìm tất cả card thuộc về user. xóa lần lượt card -> card -> user 
        const decks = await Deck.find({ user_id: userId });
        const deckIds = decks.map(deck => deck._id);

        await Card.deleteMany({ deck_id: { $in: deckIds } });

        await Deck.deleteMany({ user_id: userId });

        await User.findByIdAndDelete(userId);

        res.json({ message: 'User account and all associated data deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Change password
// @route   PATCH /api/users/password
// @access  Private
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current and new password are required' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const ok = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!ok) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(newPassword, salt);
        user.passwordHash = passwordHash;
        await user.save();

        return res.json({ message: 'Password updated successfully' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
