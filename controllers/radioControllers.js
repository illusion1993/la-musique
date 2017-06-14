var mongoose = require('mongoose');
var station = require('../models/radioStationModel');

exports.getRadioStations = function(req, res) {
	var page_number = (req.query && req.query.page && (req.query.page == parseInt(req.query.page))) ? req.query.page - 1 : 0;
	station.getRadioStations(function(stations) {
		res.header("Content-Type",'application/json');
		res.json(stations);
	}, page_number);
}

exports.getRadioGenres = function(req, res) {
	var page_number = (req.query && req.query.page && (req.query.page == parseInt(req.query.page))) ? req.query.page - 1 : 0;
	station.getGenres(function(genres) {
		res.header("Content-Type",'application/json');
		res.json(genres);
	}, page_number);
}

exports.getRadioLocations = function(req, res) {
	var page_number = (req.query && req.query.page && (req.query.page == parseInt(req.query.page))) ? req.query.page - 1 : 0;
	station.getLocations(function(locations) {
		res.header("Content-Type",'application/json');
		res.json(locations);
	}, page_number);
}

exports.getRadioLanguages = function(req, res) {
	var page_number = (req.query && req.query.page && (req.query.page == parseInt(req.query.page))) ? req.query.page - 1 : 0;
	station.getLanguages(function(languages) {
		res.header("Content-Type",'application/json');
		res.json(languages);
	}, page_number);
}

exports.searchRadioStations = function(req, res) {
	if (req.query && req.query.keyword && req.query.keyword.trim()) {
		station.searchRadio(function(results) {
			res.header("Content-Type",'application/json');
			res.json(results);
		}, req.query.keyword.toLowerCase().trim());
	}
	else {
		res.json([]);
	}
}