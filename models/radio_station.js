var mongoose = require('mongoose');
var cache = require('../utils/radioCache');
// var cached = false;
// var ALL_STATIONS = [];

var radioStationSchema = mongoose.Schema({
	title: { type: String },
	genre: { type: String },
	website: { type: String },
	stream: { type: String },
	location: { type: String },
	language: { type: String },
	protocol: { type: String }
});

var RadioStation = module.exports = mongoose.model('stations', radioStationSchema);

module.exports.getRadioStations = function(callback, page_number) {
	page_number = (page_number) ? page_number : 0;
	if (!cache.isset()) {
		RadioStation.find(function(err, stations) {
			if (err) {
				throw err;
			}
			console.log('caching___');
			cache.set(stations);
			callback(err, cache.get_stations(page_number));
		}).select('title genre stream location language');
	}
	else {
		callback(undefined, cache.get_stations(page_number));
	}
}

module.exports.getGenres = function(callback, page_number) {
	page_number = (page_number) ? page_number : 0;
	if (!cache.isset()) {
		RadioStation.find(function(err, stations) {
			if (err) {
				throw err;
			}
			console.log('caching___');
			cache.set(stations);
			callback(err, cache.get_genres(page_number));
		}).select('title genre stream location language');
	}
	else {
		callback(undefined, cache.get_genres(page_number));
	}
}

module.exports.getLocations = function(callback, page_number) {
	page_number = (page_number) ? page_number : 0;
	if (!cache.isset()) {
		RadioStation.find(function(err, stations) {
			if (err) {
				throw err;
			}
			console.log('caching___');
			cache.set(stations);
			callback(err, cache.get_locations(page_number));
		}).select('title genre stream location language');
	}
	else {
		callback(undefined, cache.get_locations(page_number));
	}
}

module.exports.getLanguages = function(callback, page_number) {
	page_number = (page_number) ? page_number : 0;
	if (!cache.isset()) {
		RadioStation.find(function(err, stations) {
			if (err) {
				throw err;
			}
			console.log('caching___');
			cache.set(stations);
			callback(err, cache.get_languages(page_number));
		}).select('title genre stream location language');
	}
	else {
		callback(undefined, cache.get_languages(page_number));
	}
}

module.exports.searchRadio = function(callback, keyword) {
	if (!cache.isset()) {
		RadioStation.find(function(err, stations) {
			if (err) {
				throw err;
			}
			console.log('caching___');
			cache.set(stations);
			callback(err, cache.search(keyword));
		}).select('title genre stream location language');
	}
	else {
		callback(undefined, cache.search(keyword));
	}
}