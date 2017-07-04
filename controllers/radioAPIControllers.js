module.exports = function (config) {
	var radioStationModel = require('../models/radioStationModel')();
	var requestsUtils = require('../utils/requestsUtils')();
	var module = {};

	radioStationModel.buildRadioCache(function(err){
		if (err) console.log(err);
	}, config.USE_IN_APP_CACHE, config.BUILD_SEARCH_TRIE, config.STORE_SEARCH_TRIE);

	// Calling model operations here
	module.getRadioStations = function(req, res) {
		var filters = {};
		if (req.query) {
			if (req.query.genre) filters.genre = req.query.genre;
			if (req.query.location) filters.location = req.query.location;
			if (req.query.language) filters.language = req.query.language;
		}
		radioStationModel.getRadioStations(requestsUtils.give_response(res), filters, requestsUtils.get_page_number(req), config.PAGINATION.RADIO_STATIONS_LIST);
	};

	module.getRadioGenres = function(req, res) {
		radioStationModel.getGenres(requestsUtils.give_response(res), requestsUtils.get_page_number(req), config.PAGINATION.RADIO_GENRES_LIST);
	};

	module.getRadioLocations = function(req, res) {
		radioStationModel.getLocations(requestsUtils.give_response(res), requestsUtils.get_page_number(req), config.PAGINATION.RADIO_LOCATIONS_LIST);
	};

	module.getRadioLanguages = function(req, res) {
		radioStationModel.getLanguages(requestsUtils.give_response(res), requestsUtils.get_page_number(req), config.PAGINATION.RADIO_LANGUAGES_LIST);
	};

	module.searchRadioStations = function(req, res) {
		if (req.query && req.query.keyword && req.query.keyword.trim()) {
			radioStationModel.searchRadio(requestsUtils.give_response(res), req.query.keyword.toLowerCase().trim(), !config.BUILD_SEARCH_TRIE);
		}
		else { res.json([]); }
	};

	return module;
};