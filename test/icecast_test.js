var icecast = require('icecast');
var mongoose = require('mongoose');
var momgoURI = require('./utils/mongoURI');
connection = mongoose.createConnection(momgoURI.getMongoURI('radio'));

var radioStationSchema = mongoose.Schema({
	title: { type: String },
	genre: { type: String },
	website: { type: String },
	stream: { type: String },
	location: { type: String },
	language: { type: String },
	protocol: { type: String }
});
var RadioStation = connection.model('stations', radioStationSchema);
var ALL_STATIONS;




module.exports.get_meta = function(station) {
	if (station.stream) {
		icecast.get(station.stream, function (res) {
			// log the HTTP response headers 
			//console.error(res.headers);

			// log any "metadata" events that happen 
			// res.on('metadata', function (metadata) {
			// 	var parsed = icecast.parse(metadata);
			// 	console.log(station.title + '___');
			// 	console.log(parsed.StreamTitle);
			// });
			// res.on('error', function () {
			// 	console.log('CUSTOM ERROR_____');
			// });
			// console.log('res object is ');
			// console.log(res);


			res.on('metadata', function() {
				console.log(station.title);
				console.log('Event metadata');
			});
			res.on('end', function() {
				console.log(station.title);
				console.log('Event end');
			});
			res.on('prefinish', function() {
				console.log(station.title);
				console.log('Event prefinish');
			});
			res.on('unpipe', function() {
				console.log(station.title);
				console.log('Event unpipe');
			});
			res.on('drain', function() {
				console.log(station.title);
				console.log('Event drain');
			});
			res.on('error', function() {
				console.log(station.title);
				console.log('Event error');
			});
			res.on('close', function() {
				console.log(station.title);
				console.log('Event close');
			});
			res.on('finish', function() {
				console.log(station.title);
				console.log('Event finish');
			});
		});
	}
	else {
		console.log(station.title + ': No Stream URL');
	}
};

module.exports.load_all = function() {
	RadioStation.find(function(err, stations) {
		if (stations) ALL_STATIONS = stations;
		console.log('Loaded all stations____');
	}).select('title genre stream location language');
};

module.exports.get_all_stations = function() {
	return ALL_STATIONS;
};