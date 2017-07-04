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

	module.get_paginated_object = function (objects) {

	};

	module.transform_paginated_object = function (data, page, pagination_size, pages, items) {
		return {
			data: data,
			page_number: page,
			page_size: pagination_size,
			total_pages: pages,
			total_items: items
		};
	};

	return module;
};