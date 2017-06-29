var artistModel = require('../models/artistModel');

exports.getArtists = function(req, res) {
	var page_number = (req.query && req.query.page && (req.query.page == parseInt(req.query.page))) ? req.query.page - 1 : 0;
	artistModel.getArtists(function(artists) {
		res.header("Content-Type",'application/json');
		res.json(artists);
	}, page_number);
}