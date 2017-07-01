var mongoose = require('mongoose');
var dbConnection = require('../db/tries');
var trieNodeSchema = mongoose.Schema({
	value: { type: String },
	index: { type: Number }
}, { strict: false });

var TrieNodeModel = module.exports = dbConnection.model('radio', trieNodeSchema);