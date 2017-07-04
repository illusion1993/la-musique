module.exports = function () {
	var mongoose = require('mongoose');
	var mongoosePaginate = require('mongoose-paginate');
	var dbConnection = require('./db/discogs');
	var requestsUtils = require('../utils/requestsUtils')();
	
	// Schema for 'songs' collection in 'discogs' db
	var songSchema = mongoose.Schema({
		title: { type: String },
		release: { type: String },
		duration: { type: String },
	});
	songSchema.plugin(mongoosePaginate);

	// Model for 'songs' collection in 'discogs' db
	var module = Song = dbConnection.model('songs', songSchema);

	module.getSongs = function (callback, page_number, pagination_size) {
		Song.paginate({}, { page: page_number, limit: pagination_size }, function(err, songs) {
			callback(requestsUtils.transform_paginated_object(songs.docs, songs.page, songs.limit, songs.pages, songs.total));
		});
	};

	return module;
};