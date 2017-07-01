var mongoose = require('mongoose');
var dbConnection = require('../db/tries');
var trieNodeSchema = mongoose.Schema({
	value: { type: String },
	index: { type: Number }
}, { strict: false });

var TrieNodeModel = dbConnection.model('radio', trieNodeSchema);

function search(keyword, callback) {
	// this.results = {};
	this.nodes = [];
	// this.children_ids = [];
	this.keyword = keyword || '';
	this.callback = callback;

	this._find_next = function(index) {
		if (index == this.keyword.length) {
			var results = {};
			this.nodes.forEach(function(obj, index) {
				obj.data.forEach(function(id) {
					results[id] = true;
				})
			});
			console.log('result ids are: ' + Object.keys(results));
			return;
		}

		var self = this;
		var query_filter = {};

		if (index == 0) {
			query_filter.value = this.keyword[index];
		}
		
		else {
			// find children indices of self.nodes
			var children_indices = [];
			// self.nodes = JSON.parse(JSON.stringify(self.nodes));
			self.nodes.forEach(function(obj) {
				children_indices.push(obj[keyword[index]]);
			});
			query_filter.index = { $in: children_indices };
		}
		// We need to filter nodes for those which have next char as a child
		if (this.keyword.length > index + 1) {
			query_filter[keyword[index + 1]] = { $exists: true };
		}

		TrieNodeModel.find(query_filter, function(err, nodes) {
			self.nodes = JSON.parse(JSON.stringify(nodes));
			self._find_next(index + 1);
		});
	}
}

var s = new search('rmf');
s._find_next(0);