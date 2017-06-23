var mongoose = require('mongoose');
var momgoURI = require('../utils/mongoURI');

// mongoose.connect(momgoURI.getMongoURI('radio'));
connection = mongoose.createConnection(momgoURI.getMongoURI('radio'));

module.exports = connection;