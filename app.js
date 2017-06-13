var express = require("express");
var mongoose = require('mongoose');
var path = require("path");
var bodyParser = require("body-parser");
var t = require("./utils/trie");
var m = require("./utils/mongo_uri");
var station = require("./models/radio_station");

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// var connection = mongoose.createConnection(m.getMongoURI("radio"));
mongoose.connect(m.getMongoURI("radio"));

// viewed at http://localhost:8080
app.get('/', function(req, res) {
	res.sendFile(path.join(__dirname + '/index.html'));
});

// var stationModel = connection.model('stations', stationSchema);

// var ALL_STATIONS = [];
// var trie = new t.Trie();
// stationModel.find({}, function(err, stations) {
// 	ALL_STATIONS = stations;
// 	console.log("Loaded all stations___");
// 	stations.forEach(function(obj, index){
// 		if (obj.title) trie.insert(obj.title.toLowerCase(), index);
// 		if (obj.genre) trie.insert(obj.genre.toLowerCase(), index);
// 		if (obj.location) trie.insert(obj.location.toLowerCase(), index);
// 		if (obj.language) trie.insert(obj.language.toLowerCase(), index);
// 	});
// 	console.log("Made trie___");
// }).select('title genre stream location language');

// function searchInStations(keyword) {
// 	console.log("Search initiated___");
// 	var results = [];
// 	for (station_index in ALL_STATIONS) {
// 		var cur = ALL_STATIONS[station_index];
// 		if ((cur.title && cur.title.indexOf(keyword) != -1) || (cur.genre && cur.genre.indexOf(keyword) != -1) || (cur.location && cur.location.indexOf(keyword) != -1) || (cur.language && cur.language.indexOf(keyword) != -1)) {
// 			results.push(cur);
// 		}
// 	}
// 	console.log("Search finished with " + results.length + " results___");
// 	console.log("Now doing trie-search___");
// 	var a = trie.search(keyword, 1);
// 	console.log("Got trie result with " + a.length + " results___");
// 	return a;
// 	return results;
// }

app.get('/stations', function(req, res) {
	// var filter = {};
	// if (req.query && req.query.location) filter.location = req.query.location;
	// if (req.query && req.query.language) filter.language = req.query.language;
	// if (req.query && req.query.genre) filter.genre = req.query.genre;
	// if (req.query && req.query.title) filter.title = req.query.title;

	// stationModel.find(filter, function(err, stations) {
	// 	res.header("Content-Type",'application/json');
	// 	res.send(JSON.stringify(stations, null, 4));
	// }).limit(100);
	station.getRadioStations(function(err, stations) {
		res.header("Content-Type",'application/json');
		res.json(stations);
	}, 10);
});

// app.get('/stations/search', function(req, res) {
// 	if (req.query && req.query.keyword) {
// 		res.header("Content-Type",'application/json');
// 		// res.send(JSON.stringify(searchInStations(req.query.keyword), null, 4));
// 		console.log('new method');
// 		res.send(searchInStations(req.query.keyword));
// 	}
// 	else {
// 		res.send([]);
// 	}
// });

// app.get('/stations/search/compare', function(req, res) {
// 	if (req.query && req.query.keyword) {
// 		results = searchInStationsGenre(req.query.keyword);
// 		console.log(results);
// 		console.log('Now executing mongo search___');
// 		stationModel.find({genre: req.query.keyword}, function(err, stations) {
// 			console.log('Mongo search finished___');
// 			res.header("Content-Type",'application/json');
// 			console.log(stations);
// 			res.send(JSON.stringify(stations, null, 4));
// 		});
// 	}
// 	else {
// 		res.send([]);
// 	}
// });

// app.get('/genres', function(req, res) {
// 	stationModel.find().distinct('genre', function(err, genres) {
// 		res.header("Content-Type",'application/json');
// 		res.send(JSON.stringify(genres, null, 4));
// 	});
// });

// app.get('/locations', function(req, res) {
// 	stationModel.find().distinct('location', function(err, locations) {
// 		res.header("Content-Type",'application/json');
// 		res.send(JSON.stringify(locations, null, 4));
// 	});
// });

// app.get('/languages', function(req, res) {
// 	stationModel.find().distinct('language', function(err, languages) {
// 		res.header("Content-Type",'application/json');
// 		res.send(JSON.stringify(languages, null, 4));
// 	});
// });

console.log("App running on port 8000");
app.listen(8000);
