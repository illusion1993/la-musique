var mongoose = require('mongoose');
var dbConnection = require('../db/discogs');

var artistSchema = mongoose.Schema({
	name: { type: String },
});

var Artist = module.exports = dbConnection.model('artists', artistSchema);

module.exports.getArtists = function(callback) {
	callback([]);
}