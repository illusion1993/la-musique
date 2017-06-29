var mongoose = require('mongoose');
var mongoURI = require('../utils/mongoURI');

connection = mongoose.createConnection(mongoURI.getMongoURI('discogs'));

module.exports = connection;