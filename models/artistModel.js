module.exports = function () {
	var mongoose = require('mongoose');
	var dbConnection = require('./db/discogs');
	var trieDbConnection = require('./db/tries');
	var artistCache = require('./cache/artistCache');
	var mongoosePaginate = require('mongoose-paginate');
	var requestsUtils = require('../utils/requestsUtils')();
	
	// Schema for 'artists' collection in 'discogs' db
	var artistSchema = mongoose.Schema({
		name: { type: String },
	});
	artistSchema.plugin(mongoosePaginate);

	// Schema for 'artists' collection in 'tries' db
	var trieNodeSchema = mongoose.Schema({
		value: { type: String },
		index: { type: Number }
	}, { strict: false });

	// Model for 'artists' collection in 'discogs' db
	var module = Artist = dbConnection.model('artists', artistSchema);

	// Model for 'artists' collection in 'tries' db
	var TrieNodeModel = trieDbConnection.model('artist', trieNodeSchema);

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

	module.buildArtistCache = function(callback, build_cache, build_trie, store_trie) {
		Artist.find(function(err, artists) {
			if (artists) {
				if (build_cache) artistCache.set(artists);
				if (build_trie) {
					artistCache.build_trie(artists, function() {});
					if (store_trie) {
						var trie_nodes = artistCache.get_trie_nodes();
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
										else artistCache.clear_trie_data();
									}
								})
							}
							insert_batch();
						});

					}
				}
			}
			if (callback && typeof(callback) == 'function') callback(err);
		});
	};

	module.getArtistsByIds = function(callback, ids) {
		if (artistCache.isset()) {
			console.log('Getting artists by Ids from cache___');
			callback(artistCache.get_results_from_ids(ids));
		}
		else {
			console.log('Getting artists by Ids from db___');
			ids.forEach(function(obj, index, arr) {
				arr[index] = mongoose.Types.ObjectId(obj);
			});
			Artist.find({
				_id: { $in: ids }
			}, function(err, results) {
				callback(results);
			});
		}
	};

	module.getArtists = function (callback, page_number, pagination_size) {
		if (artistCache.isset())
			callback(requestsUtils.get_paginated_object(artistCache.get_artists(), page_number, pagination_size));
		else {
			Artist.paginate({}, { page: page_number, limit: pagination_size }, function(err, artists) {
				callback(requestsUtils.transform_paginated_object(artists.docs, artists.page, artists.limit, artists.pages, artists.total));
			});
		}
	};

	module.searchArtists = function(callback, keyword, from_db_trie) {
		if (from_db_trie) {
			console.log('artist search from trie db, because asked so___');
			var s = new trieDbSearch(keyword, function(search_result_ids) {
				module.getArtistsByIds(callback, search_result_ids);
			});
		}
		else {
			console.log('artist search cache trie, because asked so___');
			// module.getRadioStationsByIds(callback, radioCache.search(keyword));
			var node_index = artistCache.search(keyword);
			if (node_index > 0) {
				TrieNodeModel.findOne({index: node_index}, function(err, node) {
					console.log('Got the same node from trie db: ');
					node = JSON.parse(JSON.stringify(node));
					console.log(node);
					module.getArtistsByIds(callback, node.data);
				}).select('data');
			}
		}
	};

	return module;
};