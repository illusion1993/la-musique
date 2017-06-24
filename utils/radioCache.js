var t = require('./trie');
var icecastParser = require('icecast-parser');

module.exports = function () {
	var COLLECTION = {};
    COLLECTION.ALL_STATIONS = [];
    COLLECTION.ALL_GENRES = [];
    COLLECTION.ALL_LOCATIONS = [];
    COLLECTION.ALL_LANGUAGES = [];
    COLLECTION.METADATA = {};
    COLLECTION.INVALID_STREAM_URLS = {};

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

                // Getting Radio Stream Metadata
                if (obj.stream && obj.stream.length) {
                    if (obj.stream.indexOf('://') != -1 && obj.stream.indexOf('http://') != -1) {
                        var radioStation = new icecastParser({
                            url: obj.stream, // URL to radio station 
                            keepListen: false, // don't listen radio station after metadata was received 
                            autoUpdate: true, // update metadata after interval 
                            errorInterval: 10 * 60, // retry connection after 10 minutes 
                            emptyInterval: 5 * 60, // retry get metadata after 5 minutes 
                            metadataInterval: 20 // update metadata after 20 seconds 
                        });
                        radioStation.on('metadata', function(metadata) {
                            // console.log('setting for index: ' + index);
                            // COLLECTION.ALL_STATIONS[index]['working'] = true;
                            // COLLECTION.ALL_STATIONS[index]['now_playing'] = metadata.StreamTitle;

                            // console.log('meta - ' + COLLECTION.ALL_STATIONS[index]);
                            COLLECTION.METADATA[index] = metadata;
                            // console.log(COLLECTION.METADATA);
                        });
                        radioStation.on('error', function(error) {
                            // COLLECTION.ALL_STATIONS[index].working = false;
                            // console.log('err - ' + COLLECTION.ALL_STATIONS[index]);
                        });
                        radioStation.on('empty', function() {
                            // COLLECTION.ALL_STATIONS[index].now_playing = '';
                            // console.log('empty - ' + COLLECTION.ALL_STATIONS[index]);
                        });
                    }
                    else {
                        console.log('Faulty Stream URL: ' + obj.stream);
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
        		if (collection_number == 1) {
                    var result = {
                        _id: COLLECTION.ALL_STATIONS[begin]._id,
                        title: COLLECTION.ALL_STATIONS[begin].title,
                        genre: COLLECTION.ALL_STATIONS[begin].genre,
                        location: COLLECTION.ALL_STATIONS[begin].location,
                        language: COLLECTION.ALL_STATIONS[begin].language,
                        stream: COLLECTION.ALL_STATIONS[begin].stream,
                        meta: COLLECTION.METADATA[begin]
                    };
                    results.push(result);
                    console.log("Metadata is found for " + COLLECTION.METADATA.length + "/" + COLLECTION.ALL_STATIONS.length + " Radio Stations.");
                }
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
        get_stations: function (filters, page_number) {
            if (!filters.genre && !filters.location && !filters.language) return this._get(page_number, 1);
            else {
                var page_size_for_this, collection_size;
                var results = [], page_results = [];
                COLLECTION.ALL_STATIONS.forEach(function(station) {
                    var okay_to_add = true;
                    for (filter_name in filters) {
                        if (!station[filter_name] || filters[filter_name].toLowerCase() != station[filter_name].toLowerCase()) 
                            okay_to_add = false;
                    }
                    if (okay_to_add) results.push(station);
                });

                page_size_for_this = pagination_page_size.stations;
                collection_size = results.length;
                var begin = page_number * page_size_for_this, end = begin + page_size_for_this;

                while(begin < end && begin < collection_size) {
                    page_results.push(results[begin]);
                    begin++;
                }
                return {
                    results: page_results,
                    page_number: page_number + 1,
                    page_size: page_size_for_this,
                    total_pages: parseInt(collection_size / page_size_for_this) + (collection_size % page_size_for_this != 0),
                    total_items: collection_size
                };
            }
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
        trieSearch: function (keyword) {
        	var result_ids = [], results = [];
        	result_ids = trie.search(keyword, 1);
        	result_ids.forEach(function(obj) {
        		results.push(COLLECTION.ALL_STATIONS[obj]);
        	});
        	return results;
        },
        simpleSearch: function (keyword) {
            var results = [];
            keyword = keyword.toLowerCase();
            COLLECTION.ALL_STATIONS.forEach(function(station) {
                var title = (station.title) ? station.title.toLowerCase() : '',
                genre = (station.genre) ? station.genre.toLowerCase() : '',
                location = (station.location) ? station.location.toLowerCase() : '',
                language = (station.language) ? station.language.toLowerCase() : '';

                if (title.indexOf(keyword) != -1 || genre.indexOf(keyword) != -1 || location.indexOf(keyword) != -1 || language.indexOf(keyword) != -1) {
                    results.push(station);
                }
            });
            return results;
        },

        isset: function() { return cache_set; }
    }
}();