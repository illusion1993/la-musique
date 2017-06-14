var t = require('./trie');

module.exports = function () {
	var COLLECTION = {};
    COLLECTION.ALL_STATIONS = [];
    COLLECTION.ALL_GENRES = [];
    COLLECTION.ALL_LOCATIONS = [];
    COLLECTION.ALL_LANGUAGES = [];

    var trie = new t.Trie();

    var pagination_page_size = {
    	stations: 20,
    	genres: 20,
    	locations: 20,
    	languages: 20
    };
    var cache_set = false;
    return {
    	set: function (val) {
        	COLLECTION.ALL_STATIONS = val; cache_set = true;
        	covered = {
        		title: {},
        		genre: {},
        		location: {},
        		language: {}
        	}
        	COLLECTION.ALL_STATIONS.forEach(function(obj, index) {
        		if (obj.title) {
        			trie.insert(obj.title.toLowerCase().trim(), index);
        		}
        		if (obj.genre) {
        			trie.insert(obj.genre.toLowerCase().trim(), index);
        			if (!covered.genre[obj.genre]) {
        				COLLECTION.ALL_GENRES.push(obj.genre);
        				covered.genre[obj.genre] = true;
        			}
        		}
        		if (obj.location) {
        			trie.insert(obj.location.toLowerCase().trim(), index);
        			if (!covered.location[obj.location]) {
        				COLLECTION.ALL_LOCATIONS.push(obj.location);
        				covered.location[obj.location] = true;
        			}
        		}
        		if (obj.language) {
        			trie.insert(obj.language.toLowerCase().trim(), index);
        			if (!covered.language[obj.language]) {
        				COLLECTION.ALL_LANGUAGES.push(obj.language);
        				covered.language[obj.language] = true;
        			}
        		}
        	});
        },
        _get: function(page_number, collection_number) {
        	var page_size_for_this, collection_size;

        	if (collection_number == 1) { page_size_for_this = pagination_page_size.stations; collection_size = COLLECTION.ALL_STATIONS.length; }
        	if (collection_number == 2) { page_size_for_this = pagination_page_size.genres; collection_size = COLLECTION.ALL_GENRES.length; }
        	if (collection_number == 3) { page_size_for_this = pagination_page_size.locations; collection_size = COLLECTION.ALL_LOCATIONS.length; }
        	if (collection_number == 4) { page_size_for_this = pagination_page_size.languages; collection_size = COLLECTION.ALL_LANGUAGES.length; }

        	var begin = page_number * page_size_for_this, end = begin + page_size_for_this;
        	var results = [];
        	while(begin < end && begin < collection_size) {
        		if (collection_number == 1) results.push(COLLECTION.ALL_STATIONS[begin]);
	        	if (collection_number == 2) results.push(COLLECTION.ALL_GENRES[begin]);
	        	if (collection_number == 3) results.push(COLLECTION.ALL_LOCATIONS[begin]);
	        	if (collection_number == 4) results.push(COLLECTION.ALL_LANGUAGES[begin]);
        		begin++;
        	}
        	return {
        		results: results,
        		page_number: page_number + 1,
        		page_size: page_size_for_this,
        		total_pages: parseInt(collection_size / page_size_for_this) + (collection_size % page_size_for_this != 0),
        		total_items: collection_size
        	};
        },
        get_stations: function (page_number) {
        	return this._get(page_number, 1);
        },
        get_genres: function (page_number) {
        	return this._get(page_number, 2);
        },
        get_locations: function (page_number) {
        	return this._get(page_number, 3);
        },
        get_languages: function (page_number) {
        	return this._get(page_number, 4);
        },
        search: function (keyword) {
        	var result_ids = [], results = [];
        	result_ids = trie.search(keyword, 1);
        	result_ids.forEach(function(obj) {
        		results.push(COLLECTION.ALL_STATIONS[obj]);
        	});
        	return results;
        },

        isset: function() { return cache_set; }
    }
}();