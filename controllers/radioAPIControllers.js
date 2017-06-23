var radioStationModel = require('../models/radioStationModel');

exports.getRadioStations = function(req, res) {
	var page_number = (req.query && req.query.page && (req.query.page == parseInt(req.query.page))) ? req.query.page - 1 : 0;
	var filters = {};
	
	if (req.query) {
		if (req.query.genre) filters.genre = req.query.genre;
		if (req.query.location) filters.location = req.query.location;
		if (req.query.language) filters.language = req.query.language;
	}

	radioStationModel.getRadioStations(function(stations) {
		res.header("Content-Type",'application/json');
		res.json(stations);
	}, filters, page_number);
}

exports.getRadioGenres = function(req, res) {
	var page_number = (req.query && req.query.page && (req.query.page == parseInt(req.query.page))) ? req.query.page - 1 : 0;
	radioStationModel.getGenres(function(genres) {
		res.header("Content-Type",'application/json');
		res.json(genres);
	}, page_number);
}

exports.getRadioLocations = function(req, res) {
	var page_number = (req.query && req.query.page && (req.query.page == parseInt(req.query.page))) ? req.query.page - 1 : 0;
	radioStationModel.getLocations(function(locations) {
		res.header("Content-Type",'application/json');
		res.json(locations);
	}, page_number);
}

exports.getRadioLanguages = function(req, res) {
	var page_number = (req.query && req.query.page && (req.query.page == parseInt(req.query.page))) ? req.query.page - 1 : 0;
	radioStationModel.getLanguages(function(languages) {
		res.header("Content-Type",'application/json');
		res.json(languages);
	}, page_number);
}

exports.searchRadioStations = function(req, res) {
	if (req.query && req.query.keyword && req.query.keyword.trim()) {
		radioStationModel.searchRadio(function(results) {
			res.header("Content-Type",'application/json');
			res.json(results);
		}, req.query.keyword.toLowerCase().trim());
	}
	else {
		res.json([]);
	}
}