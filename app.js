var express = require("express");
var mongoose = require('mongoose');
var path = require("path");
var bodyParser = require("body-parser");
var m = require("./utils/mongo_uri");
var station = require("./models/radio_station");

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(m.getMongoURI("radio"));


app.get('/', function(req, res) {
	res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/stations', function(req, res) {
	console.log(req.query);
	var page_number = (req.query && req.query.page && (req.query.page == parseInt(req.query.page))) ? req.query.page - 1 : 0;
	station.getRadioStations(function(err, stations) {
		res.header("Content-Type",'application/json');
		res.json(stations);
	}, page_number);
});

app.get('/genres', function(req, res) {
	var page_number = (req.query && req.query.page && (req.query.page == parseInt(req.query.page))) ? req.query.page - 1 : 0;
	station.getGenres(function(err, genres) {
		res.header("Content-Type",'application/json');
		res.json(genres);
	}, page_number);
});

app.get('/locations', function(req, res) {
	var page_number = (req.query && req.query.page && (req.query.page == parseInt(req.query.page))) ? req.query.page - 1 : 0;
	station.getLocations(function(err, locations) {
		res.header("Content-Type",'application/json');
		res.json(locations);
	}, page_number);
});

app.get('/languages', function(req, res) {
	var page_number = (req.query && req.query.page && (req.query.page == parseInt(req.query.page))) ? req.query.page - 1 : 0;
	station.getLanguages(function(err, languages) {
		res.header("Content-Type",'application/json');
		res.json(languages);
	}, page_number);
});

app.get('/stations/search', function(req, res) {
	if (req.query && req.query.keyword && req.query.keyword.trim()) {
		station.searchRadio(function(err, results) {
			res.header("Content-Type",'application/json');
			res.json(results);
		}, req.query.keyword.toLowerCase().trim());
	}
	else {
		res.json([]);
	}
});

console.log("App running on port 8000");
app.listen(8000);
