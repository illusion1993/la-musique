var t = require('./trie')();

module.exports = function () {
    var COLLECTION = {};
    COLLECTION.ALL_ARTISTS = [];
    COLLECTION.ID_TO_INDEX = {};

    var trie = new t.Trie();
    var cache_set = false;
    return {
        build_trie: function (data, callback) {
            data = JSON.parse(JSON.stringify(data));
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

                if (obj.realname) { insert_words(obj.realname); }
                if (obj.l_name) { insert_words(obj.l_name); }
            });
            trie.total_nodes_count();
            console.log('Built artist trie___');
            if (callback && typeof(callback) == 'function') callback();
        },
        
        get_trie_nodes: function () {
            return trie.get_nodes();
        },
        
        set: function (val) {
            COLLECTION.ALL_ARTISTS = val; 
            cache_set = true;
            
            COLLECTION.ALL_ARTISTS.forEach(function(obj, index) {
                if (obj._id) COLLECTION.ID_TO_INDEX[obj._id] = index;
            });
            console.log('Built artist cache___');
        },
        
        get_artists: function (page_number, pagination_size) {
            return COLLECTION.ALL_ARTISTS;
        },

        get_results_from_ids: function (ids) {
            var results = [];
            ids.forEach(function(id) {
                results.push(COLLECTION.ALL_ARTISTS[COLLECTION.ID_TO_INDEX[id]]);
            });
            return results;
        },
        
        search: function (keyword) {
            return trie.search(keyword, 0);
        },

        isset: function() { return cache_set; },

        clear_trie_data: function() {
            trie.clear_data();
        }
    }
}();