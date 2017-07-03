var t = require('./trie');

module.exports = function () {
    var COLLECTION = {};
    COLLECTION.ALL_STATIONS = [];
    COLLECTION.ALL_GENRES = [];
    COLLECTION.ALL_LOCATIONS = [];
    COLLECTION.ALL_LANGUAGES = [];
    COLLECTION.ID_TO_INDEX = {};

    var trie = new t.Trie();
    var cache_set = false;
    return {
        build_trie: function (data, callback) {
            data.forEach(function(obj, index) {
                var insert_words = function(str) {
                    str = str.toLowerCase().trim();
                    var words = '';
                    for (var i = 0; i < str.length; i++) {
                        if (str[i] == ' ' || (str[i] >= '0' && str[i] <= '9') || (str[i] >= 'a' && str[i] <= 'z')) words += str[i];
                        else if (words[words.length - 1] != ' ' && i != str.length - 1) words += ' ';
                    }
                    words = words.split(' ');
                    words.forEach(function(word) { trie.insert(word, obj._id); })
                };

                if (obj.title) { insert_words(obj.title); }
                if (obj.genre) { insert_words(obj.genre); }
                if (obj.location) { insert_words(obj.location); }
                if (obj.language) { insert_words(obj.language); }
            });
            trie.total_nodes_count();
            console.log('Built radio trie___');
            if (callback && typeof(callback) == 'function') callback();
        },
        
        get_trie_nodes: function () {
            return trie.get_nodes();
        },
        
        set: function (val) {
            COLLECTION.ALL_STATIONS = val; 
            cache_set = true;

            var map = {
                genre: {},
                location: {},
                language: {}
            };
            COLLECTION.ALL_STATIONS.forEach(function(obj, index) {
                if (obj._id) COLLECTION.ID_TO_INDEX[obj._id] = index;
                if (obj.genre) { map.genre[obj.genre] = true; }
                if (obj.location) { map.location[obj.location] = true; }
                if (obj.language) { map.language[obj.language] = true; }
            });
            COLLECTION.ALL_GENRES = Object.keys(map.genre);
            COLLECTION.ALL_LOCATIONS = Object.keys(map.location);
            COLLECTION.ALL_LANGUAGES = Object.keys(map.language);
            console.log('Built radio cache___');
        },

        _get: function(page_number, pagination_size, collection_number) {
            var collection_sizes = [
                0, 
                COLLECTION.ALL_STATIONS.length, 
                COLLECTION.ALL_GENRES.length, 
                COLLECTION.ALL_LOCATIONS.length, 
                COLLECTION.ALL_LANGUAGES.length
            ];
            var collection_size = collection_sizes[collection_number];
            var begin = page_number * pagination_size, end = begin + pagination_size;
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
                page_size: pagination_size,
                total_pages: parseInt(collection_size / pagination_size) + (collection_size % pagination_size != 0),
                total_items: collection_size
            };
        },
        
        get_stations: function (filters, page_number, pagination_size) {
            if (!filters.genre && !filters.location && !filters.language) return this._get(page_number, pagination_size, 1);
            else {
                var results = [], page_results = [], collection_size;
                COLLECTION.ALL_STATIONS.forEach(function(station) {
                    var okay_to_add = true;
                    for (filter_name in filters) {
                        if (!station[filter_name] || filters[filter_name].toLowerCase() != station[filter_name].toLowerCase()) 
                            okay_to_add = false;
                    }
                    if (okay_to_add) results.push(station);
                });

                collection_size = results.length;
                var begin = page_number * pagination_size, end = begin + pagination_size;

                while(begin < end && begin < collection_size) {
                    page_results.push(results[begin]);
                    begin++;
                }
                return {
                    results: page_results,
                    page_number: page_number + 1,
                    page_size: pagination_size,
                    total_pages: parseInt(collection_size / pagination_size) + (collection_size % pagination_size != 0),
                    total_items: collection_size
                };
            }
        },
        
        get_genres: function (page_number, pagination_size) {
            return this._get(page_number, pagination_size, 2);
        },
        
        get_locations: function (page_number, pagination_size) {
            return this._get(page_number, pagination_size, 3);
        },
        
        get_languages: function (page_number, pagination_size) {
            return this._get(page_number, pagination_size, 4);
        },

        get_results_from_ids: function (ids) {
            var results = [];
            ids.forEach(function(id) {
                results.push(COLLECTION.ALL_STATIONS[COLLECTION.ID_TO_INDEX[id]]);
            });
            return results;
        },
        
        search: function (keyword) {
            return trie.search(keyword, 0);
        },

        isset: function() { return cache_set; }
    }
}();