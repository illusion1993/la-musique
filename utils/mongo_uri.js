function getMongoURI(databaseName) {
	var mongoUser = encodeURIComponent(process.env.MONGO_USER);
	var mongoPassword = encodeURIComponent(process.env.MONGO_PASSWORD);
	var mongoPort = encodeURIComponent(process.env.MONGO_PORT);
	return "mongodb://" + mongoUser + ":" + mongoPassword + "@127.0.0.1:" + mongoPort + "/" + databaseName + "?authSource=" + "admin";
}

exports.getMongoURI = getMongoURI;