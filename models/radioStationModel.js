module.exports = function () {
	var mongoose = require('mongoose');
	var dbConnection = require('./db/radio');
	var trieDbConnection = require('./db/tries');
	var radioCache = require('./cache/radioCache');
	var mongoosePaginate = require('mongoose-paginate');
	var requestsUtils = require('../utils/requestsUtils')();

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
	radioStationSchema.plugin(mongoosePaginate);

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
	// Returns mongo ids of results
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
			// if (index == 0) query_filter.value = this.keyword[index];
			if (index < 0) {
				query_filter.index = 0;
			}
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
		this._find_next(-1);
	};

	module.buildRadioCache = function(callback, build_cache, build_trie, store_trie) {
		RadioStation.find(function(err, stations) {
			if (stations) {
				if (build_cache) radioCache.set(stations);
				if (build_trie) {
					radioCache.build_trie(stations, function() {});
					if (store_trie) {
						var trie_nodes = radioCache.get_trie_nodes();
						trie_nodes[0].data = [];
						// Save these nodes in bulk
						TrieNodeModel.collection.remove({}, function(err) {
							console.log('Removed all trie nodes first___');
							console.log('now going to insert ' + trie_nodes.length + ' nodes');

							// insertMany could cause memory issue on large data
							// TrieNodeModel.insertMany(trie_nodes, function(err) {
							// 	console.log('Inserted all trie nodes in db___');
							// });
							
							// This hacky solution is to insert nodes in chunks
							var next_node = 0;
							var insert_batch = function() {
								var current_batch = [], i;
								for (i = 0; i < 1000 && i + next_node < trie_nodes.length; i++) {
									trie_nodes[i + next_node]['$'] = undefined;
									current_batch.push(trie_nodes[i + next_node]);
								}
								next_node = next_node + i;
								TrieNodeModel.insertMany(current_batch, function(err) {
									if (err) console.log(err);
									else {
										// console.log('inserted one more batch.');
										if (next_node < trie_nodes.length) insert_batch();
										else radioCache.clear_trie_data();
									}
								})
							}
							insert_batch();
						});

					}
				}
			}
			if (callback && typeof(callback) == 'function') callback(err);
		}).select('title genre stream location language');
	};

	module.getRadioStationsByIds = function(callback, ids) {
		if (radioCache.isset()) {
			console.log('Getting stations by Ids from cache___');
			callback(radioCache.get_results_from_ids(ids));
		}
		else {
			console.log('Getting stations by Ids from db___');
			ids.forEach(function(obj, index, arr) {
				arr[index] = mongoose.Types.ObjectId(obj);
			});
			RadioStation.find({
				_id: { $in: ids }
			}, function(err, results) {
				callback(results);
			});
		}
	};

	module.getRadioStations = function(callback, filters, page_number, pagination_size) {
		if (radioCache.isset())
			callback(requestsUtils.get_paginated_object(radioCache.get_stations(filters), page_number, pagination_size));
		else {
			RadioStation.paginate(filters, {page: page_number, limit: pagination_size, select: 'title genre stream location language'}, 
				function(err, stations) {
					if (err) console.log(err);
					else callback(requestsUtils.transform_paginated_object(stations.docs, stations.page, stations.limit, stations.pages, stations.total));
				}
			);
		}
	};

	module.getGenres = function(callback, page_number, pagination_size) {
		if (radioCache.isset())
			callback(requestsUtils.get_paginated_object(radioCache.get_genres(), page_number, pagination_size));
		else RadioStation.find({}).distinct('genre', function (err, genres) {
			if (err) console.log(err);
			else callback(requestsUtils.get_paginated_object(genres, page_number, pagination_size));
		});
	};

	module.getLocations = function(callback, page_number, pagination_size) {
		if (radioCache.isset())
			callback(requestsUtils.get_paginated_object(radioCache.get_locations(), page_number, pagination_size));
		else RadioStation.find({}).distinct('location', function (err, locations) {
			if (err) console.log(err);
			else callback(requestsUtils.get_paginated_object(locations, page_number, pagination_size));
		});
	};

	module.getLanguages = function(callback, page_number, pagination_size) {
		if (radioCache.isset())
			callback(requestsUtils.get_paginated_object(radioCache.get_languages(), page_number, pagination_size));
		else RadioStation.find({}).distinct('language', function (err, languages) {
			if (err) console.log(err);
			else callback(requestsUtils.get_paginated_object(languages, page_number, pagination_size));
		});
	};

	module.searchRadio = function(callback, keyword, from_db_trie) {
		if (from_db_trie) {
			console.log('radio search from trie db, because asked so___');
			var s = new trieDbSearch(keyword, function(search_result_ids) {
				module.getRadioStationsByIds(callback, search_result_ids);
			});
		}
		else {
			console.log('radio search cache trie, because asked so___');
			// module.getRadioStationsByIds(callback, radioCache.search(keyword));
			var node_index = radioCache.search(keyword);
			if (node_index > 0) {
				TrieNodeModel.findOne({index: node_index}, function(err, node) {
					console.log('Got the same node from trie db: ');
					node = JSON.parse(JSON.stringify(node));
					console.log(node);
					module.getRadioStationsByIds(callback, node.data);
				}).select('data');
			}
		}
	};

	return module;
}



