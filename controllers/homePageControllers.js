var path = require('path');
exports.getHomePage = function(req, res) {
	res.sendFile(path.join(__dirname + '/../static/index.html'));
};