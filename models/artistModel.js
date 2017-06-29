var mongoose = require('mongoose');
var dbConnection = require('../db/discogs');
var mongoosePaginate = require('mongoose-paginate');

var artistSchema = mongoose.Schema({
	name: { type: String },
});
artistSchema.plugin(mongoosePaginate);

var Artist = module.exports = dbConnection.model('artists', artistSchema);

module.exports.getArtists = function(callback, page_number) {
	Artist.paginate({}, { page: page_number + 1, limit: 20 }, function(err, result) {
		callback({
			results: result.docs,
			page_number: result.page,
			total_pages: result.pages,
			total_items: result.total
		});
	});
}