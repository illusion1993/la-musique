var express = require('express');
var mongoose = require('mongoose');
var path = require('path');
var bodyParser = require('body-parser');
var momgoURI = require('./utils/mongoURI');
var station = require('./models/radioStationModel');
var radioControllers = require('./controllers/radioControllers');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(momgoURI.getMongoURI('radio'));
station.buildRadioCache();

app.get('/', function(req, res) {
	res.sendFile(path.join(__dirname + '/index.html'));
});
app.get('/api/', function(req, res) {
	res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/api/radio/stations', radioControllers.getRadioStations);
app.get('/api/radio/genres', radioControllers.getRadioGenres);
app.get('/api/radio/locations', radioControllers.getRadioLocations);
app.get('/api/radio/languages', radioControllers.getRadioLanguages);
app.get('/api/radio/search', radioControllers.searchRadioStations);

console.log('App running on port 8000');
app.listen(8000);
