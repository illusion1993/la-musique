var mongoose = require('mongoose');
var mongoURI = require('./mongoURI');

connection = mongoose.createConnection(mongoURI.getMongoURI('radio'));
console.log('Connection to radio database created.');
// console.log(connection);

module.exports = connection;