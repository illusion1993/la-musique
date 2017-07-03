module.exports = function (config) {
	var radioStationModel = require('../models/radioStationModel')();
	var module = {};

	radioStationModel.buildRadioCache(function(err){
		if (err) console.log(err);
	}, config.USE_IN_APP_CACHE, config.BUILD_SEARCH_TRIE, config.STORE_SEARCH_TRIE);

	// Helper functions to handle request/response
	function get_page_number(req) {
		return (req.query && req.query.page && (req.query.page == parseInt(req.query.page))) ? req.query.page - 1 : 0;
	}

	function response(res) {
		return function(data) {
			res.header("Content-Type",'application/json');
			res.json(data);
		}
	}

	// Calling model operations here
	module.getRadioStations = function(req, res) {
		var filters = {};
		if (req.query) {
			if (req.query.genre) filters.genre = req.query.genre;
			if (req.query.location) filters.location = req.query.location;
			if (req.query.language) filters.language = req.query.language;
		}
		radioStationModel.getRadioStations(response(res), filters, get_page_number(req), config.PAGINATION.RADIO_STATIONS_LIST);
	};

	module.getRadioGenres = function(req, res) {
		radioStationModel.getGenres(response(res), get_page_number(req), config.PAGINATION.RADIO_GENRES_LIST);
	}

	module.getRadioLocations = function(req, res) {
		radioStationModel.getLocations(response(res), get_page_number(req), config.PAGINATION.RADIO_LOCATIONS_LIST);
	}

	module.getRadioLanguages = function(req, res) {
		radioStationModel.getLanguages(response(res), get_page_number(req), config.PAGINATION.RADIO_LANGUAGES_LIST);
	}

	module.searchRadioStations = function(req, res) {
		if (req.query && req.query.keyword && req.query.keyword.trim()) {
			radioStationModel.searchRadio(response(res), req.query.keyword.toLowerCase().trim(), !config.BUILD_SEARCH_TRIE);
		}
		else { res.json([]); }
	}

	return module;
}