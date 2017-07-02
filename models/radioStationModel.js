module.exports = function () {
	var mongoose = require('mongoose');
	var dbConnection = require('./db/radio');
	var trieDbConnection = require('./db/tries');
	var radioCache = require('./cache/radioCache');

	var cache_exists = trie_exists = false;

	// Schema for 'stations' collection in 'radio' db
	var radioStationSchema = mongoose.Schema({
		title: { type: String },
		genre: { type: String },
		website: { type: String },
		stream: { type: String },
		location: { type: String },
		language: { type: String },
		protocol: { type: String }
	});

	// Schema for 'radios' collection in 'tries' db
	var trieNodeSchema = mongoose.Schema({
		value: { type: String },
		index: { type: Number }
	}, { strict: false });
	
	// Model for 'stations' collection in 'radio' db
	var module = RadioStation = dbConnection.model('stations', radioStationSchema);

	// Model for 'radios' collection in 'tries' db
	var TrieNodeModel = trieDbConnection.model('radio', trieNodeSchema);

	// Function to instantiate a trie search from db
	function trieDbSearch(keyword, callback, connection) {
		this.nodes = [];
		this.keyword = keyword || '';
		this.callback = callback;
		this.connection = connection;

		this._find_next = function(index) {
			var self = this, query_filter = {};
			if (index == this.keyword.length) {
				var results = {};
				this.nodes.forEach(function(obj, index) {
					obj.data.forEach(function(id) {
						results[id] = true;
					})
				});
				if (self.callback && typeof(self.callback) == 'function') self.callback(Object.keys(results));
				// self.connection.close();
				return;
			}
			if (index == 0) query_filter.value = this.keyword[index];
			else {
				// find children indices of self.nodes
				var children_indices = [];
				self.nodes.forEach(function(obj) {
					children_indices.push(obj[keyword[index]]);
				});
				query_filter.index = { $in: children_indices };
			}
			// If there is a next char in keyword,
			// We need to filter nodes for those nodes which have next char as a child
			if (this.keyword.length > index + 1) query_filter[keyword[index + 1]] = { $exists: true };

			TrieNodeModel.find(query_filter, function(err, nodes) {
				self.nodes = JSON.parse(JSON.stringify(nodes));
				self._find_next(index + 1);
			});
		};
		this._find_next(0);
	}

	module.buildRadioCache = function(callback, build_trie, store_trie) {
		RadioStation.find(function(err, stations) {
			if (stations) {
				radioCache.set(stations);
				if (build_trie) {
					radioCache.build_trie(function() {console.log('Built Trie____')});
					if (store_trie) {
						var trie_nodes = radioCache.get_trie_nodes();
						// Save these nodes in bulk
						TrieNodeModel.collection.remove({}, function(err) {
							console.log('Removed all trie nodes first___');
							TrieNodeModel.insertMany(trie_nodes, function(err) {
								console.log('Inserted all trie nodes in db___');
							})
						});
					}
				}
			}
			if (callback && typeof(callback) == 'function') callback(err);
		}).select('title genre stream location language');
	}

	module.getRadioStations = function(callback, filters, page_number, pagination_size) {
		callback(radioCache.get_stations(filters, (page_number) ? page_number : 0, pagination_size));
	}

	module.getGenres = function(callback, page_number, pagination_size) {
		callback(radioCache.get_genres((page_number) ? page_number : 0, pagination_size));
	}

	module.getLocations = function(callback, page_number, pagination_size) {
		callback(radioCache.get_locations((page_number) ? page_number : 0, pagination_size));
	}

	module.getLanguages = function(callback, page_number, pagination_size) {
		callback(radioCache.get_languages((page_number) ? page_number : 0, pagination_size));
	}

	module.searchRadio = function(callback, keyword, from_db) {
		if (from_db) {
			console.log('radio search from trie db');
			var s = new trieDbSearch(keyword, function(search_result_ids) {
				if (radioCache.isset()) callback(radioCache.get_results_from_ids(search_result_ids));
				else {
					console.log('result objects retrieval from db as well');
					search_result_ids.forEach(function(obj, index, arr) {
						arr[index] = mongoose.Types.ObjectId(obj);
					});
					RadioStation.find({
						_id: { $in: search_result_ids }
					}, function(err, results) {
						callback(results);
					});
				}
			});
		}
		else callback(radioCache.search(keyword));
	}

	return module;
}



