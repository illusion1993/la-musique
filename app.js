var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var admin = require("firebase-admin");

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// viewed at http://localhost:8080
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

// at "http://localhost:8080/users-count" we will get no of users
app.get('/test-api', function(req, res) {
    res.send({
        "data": 120,
        "status": "ok"
    })
});

const mongoose = require('mongoose');
var connection = mongoose.createConnection('mongodb://localhost:27018/radio?connectTimeoutMS=100000&socketTimeoutMS=100000');

console.log("App running on port 8000");
app.listen(8000);
