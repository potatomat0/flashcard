const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
	username: {type: String, required: true, unique: true, trim: true},
	name: {type: String, required: true},
	email: {type: String, required: true, unique: true},
	passwordHash: {type: String, required: true},
	emailConfirmed: {type: Boolean, default: false}}, {timestamps: true});

module.exports = mongoose.model('User', userSchema)
