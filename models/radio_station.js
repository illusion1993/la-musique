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

module.exports.getRadioStations = function(callback, limit) {
	if (cache.isset()) {
		console.log('returning from cache___');
		callback(undefined, cache.get());
	}
	else {
		RadioStation.find(function(err, stations) {
			if (err) {
				throw err;
			}
			console.log('caching___');
			// ALL_STATIONS = stations;
			cache.set(stations);
			callback(err, stations);
		});
	}
}