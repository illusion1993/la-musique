module.exports = function (config) {
	var artistModel = require('../models/artistModel')();
	var requestsUtils = require('../utils/requestsUtils')();
	var module = {};

	console.log('artistAPIController going to call buildArtistCache on artistModel');
	artistModel.buildArtistCache(function(err){
		if (err) console.log(err);
	}, config.USE_IN_APP_CACHE, config.BUILD_SEARCH_TRIE, config.STORE_SEARCH_TRIE);

	module.getArtists = function(req, res) {
		artistModel.getArtists(requestsUtils.give_response(res), requestsUtils.get_page_number(req), config.PAGINATION.ARTISTS_LIST);
	};

	module.searchArtists = function(req, res) {
		if (req.query && req.query.keyword && req.query.keyword.trim()) {
			artistModel.searchArtists(requestsUtils.give_response(res), req.query.keyword.toLowerCase().trim(), !config.BUILD_SEARCH_TRIE);
		}
		else { res.json([]); }
	};

	return module;
};