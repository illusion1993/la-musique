var express = require('express');
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var homePageControllers = require('./controllers/homePageControllers');
app.get('/', homePageControllers.getHomePage);
app.get('/api/', homePageControllers.getHomePage);

var radioAPIControllers = require('./controllers/radioAPIControllers');
app.get('/api/radio/stations', radioAPIControllers.getRadioStations);
app.get('/api/radio/genres', radioAPIControllers.getRadioGenres);
app.get('/api/radio/locations', radioAPIControllers.getRadioLocations);
app.get('/api/radio/languages', radioAPIControllers.getRadioLanguages);
app.get('/api/radio/search', radioAPIControllers.searchRadioStations);

console.log('App running on port 8000');
app.listen(8000);
