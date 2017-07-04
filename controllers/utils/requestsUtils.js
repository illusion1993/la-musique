module.exports = function () {
	var module = {};

	// To extract 'page' query parameter from request (?page=3)
	module.get_page_number = function (req) {
		return (req.query && req.query.page && (req.query.page == parseInt(req.query.page))) ? req.query.page : 1;
	};

	// To give API response
	module.give_response = function (res) {
		return function(data) {
			res.header("Content-Type",'application/json');
			res.json(data);
		}
	};

	return module;
};