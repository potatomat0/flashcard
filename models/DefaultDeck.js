const mongoose = require('mongoose')

const defaultDeckSchema = new mongoose.Schema({
	name: { type: String,required: true},
	description: {type: String, default: ''},
	url: {type: String, default: ''},
	size: {type: Number, default: 0}
	}, {timestamps: true})

module.exports = mongoose.model('DefaultDeck',defaultDeckSchema);
