module.exports = function (config) {
	var releaseModel = require('../models/releaseModel')();
	var requestsUtils = require('../utils/requestsUtils')();
	var module = {};

	module.getReleases = function(req, res) {
		releaseModel.getReleases(requestsUtils.give_response(res), requestsUtils.get_page_number(req), config.PAGINATION.RELEASES_LIST);
	};

	return module;
};