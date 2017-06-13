var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var admin = require("firebase-admin");

var app = express();

var NODE_LIST = [];				// [ Node, Node, ... ]
var CHAR_INDICES = {};			// { c: [1, 12, 34], a: [2, 5, 6] }

function Node(value) {
	this.value = value;
	this.index = NODE_LIST.length;
	this.children_indices = {};
	this.data = [];

	if (!CHAR_INDICES[value]) CHAR_INDICES[value] = [];
	CHAR_INDICES[value].push(this.index);

	NODE_LIST.push(this);
}

Node.prototype.insert = function(word, data, index) {
	this.data.push(data);
	if (index < word.length) {
		var next_character = word[index];
		if (!this.children_indices[next_character]) this.children_indices[next_character] = new Node(next_character).index;
		NODE_LIST[this.children_indices[next_character]].insert(word, data, index + 1);
	}
}

Node.prototype.search = function(keyword, index) {
	if (index == keyword.length) return this.data;
	if (this.children_indices[keyword[index]]) return NODE_LIST[this.children_indices[keyword[index]]].search(keyword, index + 1);
	return [];
}

function Trie() {
	this.root = new Node('');
}

Trie.prototype.insert = function(word, data) {
	if (word) this.root.insert(word, data, 0);
}

Trie.prototype.search = function(keyword, search_in_between) {
	if (!search_in_between) return this.root.search(keyword, 0);
	
	var collected = {};
	var results = [];
	for (i in CHAR_INDICES[keyword[0]]) {
		var new_results = NODE_LIST[CHAR_INDICES[keyword[0]][i]].search(keyword, 1);
		new_results.forEach(function(res) {
			if (!collected[res]) {
				collected[res] = true;
				results.push(res);
			}
		});
	}
	return results;
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

function getMongoURI(databaseName) {
	var mongoUser = encodeURIComponent(process.env.MONGO_USER);
	var mongoPassword = encodeURIComponent(process.env.MONGO_PASSWORD);
	return "mongodb://" + mongoUser + ":" + mongoPassword + "@127.0.0.1:27018/" + databaseName + "?authSource=" + "admin";
}


// viewed at http://localhost:8080
app.get('/', function(req, res) {
	res.sendFile(path.join(__dirname + '/index.html'));
});

// at "http://localhost:8080/users-count" we will get no of users
app.get('/test-api', function(req, res) {
	res.setHeader('Content-Type', 'application/json');
	res.send({
		"data": 120,
		"status": "ok"
	})
});

var mongoose = require('mongoose');
var connection = mongoose.createConnection(getMongoURI("radio"));
var stationSchema = mongoose.Schema({
	title: {
		type: String
	},
	genre: {
		type: String
	},
	website: {
		type: String
	},
	stream: {
		type: String
	},
	location: {
		type: String
	},
	language: {
		type: String
	},
	protocol: {
		type: String
	}
});
var stationModel = connection.model('stations', stationSchema);

var ALL_STATIONS = [];
var trie = new Trie();

stationModel.find({}, function(err, stations) {
	ALL_STATIONS = stations;
	console.log("Loaded all stations___");
	stations.forEach(function(obj, index){
		if (obj.title) trie.insert(obj.title.toLowerCase(), index);
		if (obj.genre) trie.insert(obj.genre.toLowerCase(), index);
		if (obj.location) trie.insert(obj.location.toLowerCase(), index);
		if (obj.language) trie.insert(obj.language.toLowerCase(), index);
	});
	console.log("Made trie___");
}).select('title genre stream location language');

function searchInStations(keyword) {
	console.log("Search initiated___");
	var results = [];
	for (station_index in ALL_STATIONS) {
		var cur = ALL_STATIONS[station_index];
		if ((cur.title && cur.title.indexOf(keyword) != -1) || (cur.genre && cur.genre.indexOf(keyword) != -1) || (cur.location && cur.location.indexOf(keyword) != -1) || (cur.language && cur.language.indexOf(keyword) != -1)) {
			results.push(cur);
		}
	}
	console.log("Search finished with " + results.length + " results___");
	console.log("Now doing trie-search___");
	var a = trie.search(keyword, 1);
	console.log("Got trie result with " + a.length + " results___");
	return a;
	return results;
}

app.get('/stations', function(req, res) {
	var filter = {};
	if (req.query && req.query.location) filter.location = req.query.location;
	if (req.query && req.query.language) filter.language = req.query.language;
	if (req.query && req.query.genre) filter.genre = req.query.genre;
	if (req.query && req.query.title) filter.title = req.query.title;

    stationModel.find(filter, function(err, stations) {
    	res.header("Content-Type",'application/json');
    	res.send(JSON.stringify(stations, null, 4));
    }).limit(100);
});

app.get('/genres', function(req, res) {
    stationModel.find().distinct('genre', function(err, genres) {
    	res.header("Content-Type",'application/json');
    	res.send(JSON.stringify(genres, null, 4));
    });
});

app.get('/locations', function(req, res) {
    stationModel.find().distinct('location', function(err, locations) {
    	res.header("Content-Type",'application/json');
    	res.send(JSON.stringify(locations, null, 4));
    });
});

app.get('/languages', function(req, res) {
    stationModel.find().distinct('language', function(err, languages) {
    	res.header("Content-Type",'application/json');
    	res.send(JSON.stringify(languages, null, 4));
    });

app.get('/stations/search', function(req, res) {
	if (req.query && req.query.keyword) {
		res.header("Content-Type",'application/json');
		// res.send(JSON.stringify(searchInStations(req.query.keyword), null, 4));
		console.log('new method');
		res.send(searchInStations(req.query.keyword));
	}
	else {
		res.send([]);
	}
});

console.log("App running on port 8000");
app.listen(8000);
