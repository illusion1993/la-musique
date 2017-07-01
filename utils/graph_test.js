var NODE_LIST = {};

function Node (value) {
	this.value = value;
	this.paths = {};	// char: [array of data points]

	console.log('created node with value ' + value);
	NODE_LIST[value] = this;
}

Node.prototype.insert = function (word, data, index) {
	if (index < word.length) {
		var next_char = word[index];
		if (!this.paths.next_char) this.paths[next_char] = {};
		if (!NODE_LIST[next_char]) NODE_LIST[next_char] = new Node(next_char);
		this.paths[next_char][data] = true;

		// console.log('NODE_LIST is now ');
		// console.log(NODE_LIST);
		// console.log('Going to insert in ' + next_char);

		NODE_LIST[next_char].insert (word, data, index + 1);
	}
}

Node.prototype.search = function (keyword, index, result_collection, is_root) {
	if (keyword && index < keyword.length) {
		var next_char = keyword[index];
		if (this.paths[next_char]) {
			var new_collection = {};
			var new_paths = Object.keys(this.paths[next_char]);
			new_paths.forEach(function(item) {
				if (is_root || result_collection[item]) new_collection[item] = true;
			});
			result_collection = null;
			new_paths = null;
			return NODE_LIST[next_char].search(keyword, index + 1, new_collection, false);
		}
		return [];
	}
	return Object.keys(result_collection);
}

function Graph () {
	this.root = new Node('');
}

Graph.prototype.insert = function (word, data) {
	if (word && word.length >= 2) this.root.insert(word, data, 0);
}

Graph.prototype.search = function (keyword) {
	if (keyword.length >= 2) return this.root.search(keyword, 0, {}, true);
	return [];
}

module.exports.Graph = Graph;
module.exports.NODE_LIST = NODE_LIST;