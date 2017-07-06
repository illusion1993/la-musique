var NODE_LIST = [];				// [ Node, Node, ... ]
var CHAR_INDICES = {};			// { c: [1, 12, 34], a: [2, 5, 6] }

function Node(value) {
	this.value = value;
	this.index = NODE_LIST.length;
	this.data = [];

	if (!CHAR_INDICES[value]) CHAR_INDICES[value] = [];
	CHAR_INDICES[value].push(this.index);

	NODE_LIST.push(this);
}

Node.prototype.insert = function(word, data, index) {
	this.data.push(data);
	if (index < word.length) {
		var next_character = word[index];
		if (!this[next_character]) this[next_character] = new Node(next_character).index;
		NODE_LIST[this[next_character]].insert(word, data, index + 1);
	}
}

Node.prototype.search = function(keyword, index) {
	if (index == keyword.length) return this.index;
	if (this[keyword[index]]) return NODE_LIST[this[keyword[index]]].search(keyword, index + 1);
	return -1;
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

Trie.prototype.get_nodes = function() {
	return NODE_LIST;
}

Trie.prototype.clear_data = function() {
	NODE_LIST.forEach(function(obj, index, arr) {
		arr[index].data = undefined;
	});
	console.log('cleared all data arrays from cache trie');
}

exports.Trie = Trie;