var mongoose = require('mongoose');
var dbConnection = require('./db/discogs');
var mongoosePaginate = require('mongoose-paginate');
var appConstants = require('../appConstants');

var artistSchema = mongoose.Schema({
	name: { type: String },
});
artistSchema.plugin(mongoosePaginate);

var Artist = module.exports = dbConnection.model('artists', artistSchema);

module.exports.getArtists = function(callback, page_number) {
	var page_size = appConstants.getConstant('ARTIST_LIST_API_PAGINATION_LIMIT');
	Artist.paginate({}, { page: page_number + 1, limit: page_size }, function(err, result) {
		callback({
			results: result.docs,
			page_number: result.page,
			total_pages: result.pages,
			total_items: result.total
		});
	});
}