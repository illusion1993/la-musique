module.exports = function () {
	var mongoose = require('mongoose');
	var mongoosePaginate = require('mongoose-paginate');
	var dbConnection = require('./db/discogs');
	var requestsUtils = require('../utils/requestsUtils')();
	
	// Schema for 'releases' collection in 'discogs' db
	var releaseSchema = mongoose.Schema({
		title: { type: String },
		country: { type: String },
		notes: { type: String },
	});
	releaseSchema.plugin(mongoosePaginate);

	// Model for 'releases' collection in 'discogs' db
	var module = Release = dbConnection.model('releases', releaseSchema);

	module.getReleases = function (callback, page_number, pagination_size) {
		Release.paginate({}, { page: page_number, limit: pagination_size }, function(err, releases) {
			callback(requestsUtils.transform_paginated_object(releases.docs, releases.page, releases.limit, releases.pages, releases.total));
		});
	};

	return module;
};