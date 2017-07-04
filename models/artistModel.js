module.exports = function () {
	var mongoose = require('mongoose');
	var mongoosePaginate = require('mongoose-paginate');
	var dbConnection = require('./db/discogs');
	var requestsUtils = require('../utils/requestsUtils')();
	
	// Schema for 'artists' collection in 'discogs' db
	var artistSchema = mongoose.Schema({
		name: { type: String },
	});
	artistSchema.plugin(mongoosePaginate);

	// Model for 'artists' collection in 'discogs' db
	var module = Artist = dbConnection.model('artists', artistSchema);

	module.getArtists = function (callback, page_number, pagination_size) {
		Artist.paginate({}, { page: page_number, limit: pagination_size }, function(err, artists) {
			callback(requestsUtils.transform_paginated_object(artists.docs, artists.page, artists.limit, artists.pages, artists.total));
		});
	};

	return module;
};