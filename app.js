var express = require('express');
var bodyParser = require('body-parser');
var appConstants = require('./appConstants');

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Get required constants
const routes = appConstants.getConstant('ROUTES');
const node_port = appConstants.getConstant('NODE_PORT');
const settings = appConstants.getConstant('SETTINGS');

// Import controllers
var homePageControllers = require('./controllers/homePageControllers');
var radioAPIControllers = require('./controllers/radioAPIControllers')(settings.RADIO);
var artistAPIControllers = require('./controllers/artistAPIControllers')(settings.DISCOGS);
var songAPIControllers = require('./controllers/songAPIControllers')(settings.DISCOGS);

// Home Pages
app.get(routes.APP_HOME, homePageControllers.getHomePage);
app.get(routes.API_HOME, homePageControllers.getHomePage);

// Radio APIs
app.get(routes.RADIO_STATIONS_LIST_API, radioAPIControllers.getRadioStations);
app.get(routes.RADIO_GENRES_LIST_API, radioAPIControllers.getRadioGenres);
app.get(routes.RADIO_LOCATIONS_LIST_API, radioAPIControllers.getRadioLocations);
app.get(routes.RADIO_LANGUAGES_LIST_API, radioAPIControllers.getRadioLanguages);
app.get(routes.RADIO_SEARCH_API, radioAPIControllers.searchRadioStations);

// Artists APIs
app.get('/api/artists', artistAPIControllers.getArtists);

// Songs APIs
app.get('/api/songs', songAPIControllers.getSongs);

console.log('App running on port ' + node_port);
app.listen(node_port);
