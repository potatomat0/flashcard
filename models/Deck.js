const mongoose = require('mongoose')

const deckSchema = new mongoose.Schema({
	user_id: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
	name: { type: String,required: true},
	description: {type: String, default: ''},
	size: {type: Number, default: 0}
	}, {timestamps: true})

module.exports = mongoose.model('Deck',deckSchema);
