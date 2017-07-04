module.exports = function (config) {
	var songModel = require('../models/songModel')();
	var requestsUtils = require('../utils/requestsUtils')();
	var module = {};

	module.getSongs = function(req, res) {
		songModel.getSongs(requestsUtils.give_response(res), requestsUtils.get_page_number(req), config.PAGINATION.SONGS_LIST);
	};

	return module;
};