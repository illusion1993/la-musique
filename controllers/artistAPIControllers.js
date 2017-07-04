module.exports = function (config) {
	var artistModel = require('../models/artistModel')();
	var requestsUtils = require('../utils/requestsUtils')();
	var module = {};

	module.getArtists = function(req, res) {
		artistModel.getArtists(requestsUtils.give_response(res), requestsUtils.get_page_number(req), config.PAGINATION.ARTISTS_LIST);
	};

	return module;
};