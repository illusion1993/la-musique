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

	// Create a paginated object from an array of items
	module.get_paginated_object = function (items, page_number, pagination_size) {
		// Using 0-based index for array plucking
		page_number = (page_number) ? page_number - 1 : 0;
		var data = [];
		for (var i = page_number * pagination_size; i < items.length && i < (page_number + 1) * pagination_size; i++) {
			data.push(items[i]);
		}
		return {
			data: data,
			count: data.length,
			page_number: page_number + 1,
			page_size: pagination_size,
			total_pages: parseInt(data.length / pagination_size) + ((data.length % pagination_size) != 0),
			total_items: items.length
		};
	};

	// Transform a 'mongoose-paginate' object to desired pagination format (key names)
	module.transform_paginated_object = function (data, page, pagination_size, pages, items) {
		return {
			data: data,
			count: data.length,
			page_number: page,
			page_size: pagination_size,
			total_pages: pages,
			total_items: items
		};
	};

	return module;
};