const mongoose = require('mongoose')

const defaultCardSchema = new mongoose.Schema({
	deck_id: {type: mongoose.Schema.Types.ObjectId, ref: 'DefaultDeck', required: true}, 
	name: {type: String, required: true},
	definition: {type: String, required: true},
	word_type: {type: String, default: ''},
	url: {type: String, default: ''},
	hint: {type: String, default: ''},
	example: {type: [String], default: []},
	category: {type: [String], default: []},
	frequency: {type: Number, min: 1, max: 5, default: 3},
}, {timestamps: true})

module.exports = mongoose.model('DefaultCard', defaultCardSchema)
