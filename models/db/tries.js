var mongoose = require('mongoose');
var mongoURI = require('./mongoURI');
mongoose.Promise = global.Promise;

connection = mongoose.createConnection(mongoURI.getMongoURI('tries'));

module.exports = connection;