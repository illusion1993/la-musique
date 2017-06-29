var artistModel = require('../models/artistModel');

exports.getArtists = function(req, res) {
	artistModel.getArtists(function(artists) {
		res.header("Content-Type",'application/json');
		res.json(artists);
	});
}