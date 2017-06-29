var mongoose = require('mongoose');
var dbConnection = require('../db/radio');
var radioCache = require('../utils/radioCache');
var radioStationSchema = mongoose.Schema({
	title: { type: String },
	genre: { type: String },
	website: { type: String },
	stream: { type: String },
	location: { type: String },
	language: { type: String },
	protocol: { type: String }
});
var RadioStation = module.exports = dbConnection.model('stations', radioStationSchema);
var isBuildingCache = false, buildCache;

module.exports.buildRadioCache = buildCache = function(callback) {
	if(!isBuildingCache) {
		isBuildingCache = true;
		RadioStation.find(function(err, stations) {
			if (stations) radioCache.set(stations);
			if (callback) callback(err, stations);
			isBuildingCache = false;
			console.log('Built Radio Cache____');
		}).select('title genre stream location language');
	}
}

module.exports.getRadioStations = function(callback, filters, page_number) {
	page_number = (page_number) ? page_number : 0;
	callback(radioCache.get_stations(filters, page_number));
}

module.exports.getGenres = function(callback, page_number) {
	page_number = (page_number) ? page_number : 0;
	callback(radioCache.get_genres(page_number));
}

module.exports.getLocations = function(callback, page_number) {
	page_number = (page_number) ? page_number : 0;
	callback(radioCache.get_locations(page_number));
}

module.exports.getLanguages = function(callback, page_number) {
	page_number = (page_number) ? page_number : 0;
	callback(radioCache.get_languages(page_number));
}

module.exports.searchRadio = function(callback, keyword) {
	callback(radioCache.trieSearch(keyword));
}