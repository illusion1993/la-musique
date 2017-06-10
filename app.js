var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var admin = require("firebase-admin");

var app = express();

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

app.get('/stations', function(req, res) {
	console.log(req.query);
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
});

console.log("App running on port 8000");
app.listen(8000);
