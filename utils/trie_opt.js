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

Node.prototype.insert = function(word, data, index, tail_index) {
	if (!word || !word.length) return;
	this.data.push(data);
	if (index < word.length) {
		var next_character = word[index];
		if (!this.children_indices[next_character]) this.children_indices[next_character] = new Node(next_character).index;
		NODE_LIST[this.children_indices[next_character]].insert(word, data, index + 1, tail_index);
	}
	else {
		if (tail_index) {
			this.children_indices[NODE_LIST[tail_index].value] = tail_index;
		}
	}
}

Node.prototype.search = function(keyword, index) {
	if (index == keyword.length) return this.data;
	if (this.children_indices[keyword[index]]) return NODE_LIST[this.children_indices[keyword[index]]].search(keyword, index + 1);
	return [];
}

Node.prototype.find_overlap = function(word, index) {
	if (index == word.length || !this.children_indices[word[index]]) return 1;
	return NODE_LIST[this.children_indices[word[index]]].find_overlap(word, index + 1) + 1;
}

function Trie() {
	NODE_LIST = [];
	CHAR_INDICES = {};
	this.root = new Node('');
}

Trie.prototype.find_best_overlap = function(word) {
	var overlap = {
		node_index: null,
		word_index: null,
		length: 0
	}

	if (word) {
		for (var word_index = 0; word_index < word.length; word_index++) {
			var this_char = word[word_index];
			if (CHAR_INDICES[this_char] && CHAR_INDICES[this_char].length) {
				CHAR_INDICES[this_char].forEach(function(node_index) {
					var this_overlap = NODE_LIST[node_index].find_overlap(word, word_index + 1);
					if (this_overlap > overlap.length) {
						overlap.length = this_overlap;
						overlap.word_index = word_index;
						overlap.node_index = node_index;
					}
				});
			}
		}
	}
	return overlap;
}

Trie.prototype.insert = function(word, data) {
	if (word) {
		var overlap = this.find_best_overlap(word);
		if (overlap.length) {
			var pre = word.substring(0, overlap.word_index),
				post = word.substring(overlap.word_index);


			this.root.insert(pre, data, 0, overlap.node_index);
			NODE_LIST[overlap.node_index].insert(post, data, 1);
		}
		else {
			this.root.insert(word, data, 0);
		}
	}
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
}

exports.Trie = Trie;