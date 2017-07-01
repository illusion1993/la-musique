var TrieNodeModel = require('../models/radioTrieNodeModel');

var NODE_LIST = [];				// [ Node, Node, ... ]
var CHAR_INDICES = {};			// { c: [1, 12, 34], a: [2, 5, 6] }

function Node(value) {
	this.value = value;
	this.index = NODE_LIST.length;
	this.children_indices = {};
	this.data = [];

	if (!CHAR_INDICES[value]) CHAR_INDICES[value] = [];
	CHAR_INDICES[value].push(this.index);

	NODE_LIST.push(this);
}

Node.prototype.insert = function(word, data, index) {
	this.data.push(data);
	if (index < word.length) {
		var next_character = word[index];
		if (!this.children_indices[next_character]) this.children_indices[next_character] = new Node(next_character).index;
		NODE_LIST[this.children_indices[next_character]].insert(word, data, index + 1);
	}
}

Node.prototype.search = function(keyword, index) {
	if (index == keyword.length) return this.data;
	if (this.children_indices[keyword[index]]) return NODE_LIST[this.children_indices[keyword[index]]].search(keyword, index + 1);
	return [];
}

function Trie() {
	this.root = new Node('');
	this.data_length = 0;
}

Trie.prototype.insert = function(word, data) {
	if (word) this.root.insert(word, data, 0);
	this.data_length += word.length;
}

Trie.prototype.search = function(keyword, search_in_between) {
	if (!search_in_between) return this.root.search(keyword, 0);
	
	var collected = {};
	var results = [];
	for (i in CHAR_INDICES[keyword[0]]) {
		var new_results = NODE_LIST[CHAR_INDICES[keyword[0]][i]].search(keyword, 1);
		new_results.forEach(function(res) {
			if (!collected[res]) {
				collected[res] = true;
				results.push(res);
			}
		});
	}
	return results;
}

Trie.prototype.total_nodes_count = function() {
	console.log('Total nodes are: ' + NODE_LIST.length);
	console.log('Data length is : ' + this.data_length);
}

Trie.prototype.storeTrie = function() {
	NODE_LIST.forEach(function(obj, index) {
		var node_obj = {
			value: obj.value,
			index: obj.index,
			data: obj.data
		};
		for (var i in obj.children_indices) {
			node_obj[i] = obj.children_indices[i];
		}

		var node = new TrieNodeModel(node_obj);
		node.save(function (err, n) {
			if (err) return console.error(err);
			if (index % 100 == 0) console.log('saved ' + index);
		});
	})
}

exports.Trie = Trie;