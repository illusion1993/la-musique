var constants = {
	ARTIST_LIST_API_PAGINATION_LIMIT: 50
}

module.exports.getConstant = function(name) {
	return (constants[name]) ? constants[name] : undefined;
}