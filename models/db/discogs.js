var mongoose = require('mongoose');
var mongoURI = require('./mongoURI');

connection = mongoose.createConnection(mongoURI.getMongoURI('discogs'));
console.log('Connection to discogs database created.');

module.exports = connection;