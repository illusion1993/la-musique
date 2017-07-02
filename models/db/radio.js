var mongoose = require('mongoose');
var mongoURI = require('./mongoURI');

connection = mongoose.createConnection(mongoURI.getMongoURI('radio'));

module.exports = connection;