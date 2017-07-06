var constants = {
	ROUTES: {
		APP_HOME: '/',
		API_HOME: '/api/',
		RADIO_STATIONS_LIST_API: '/api/radio/stations',
		RADIO_GENRES_LIST_API: '/api/radio/genres',
		RADIO_LOCATIONS_LIST_API: '/api/radio/locations',
		RADIO_LANGUAGES_LIST_API: '/api/radio/languages',
		RADIO_SEARCH_API: '/api/radio/search'
	},
	SETTINGS: {
		RADIO: {
			USE_IN_APP_CACHE: false,
			BUILD_SEARCH_TRIE: true,
			STORE_SEARCH_TRIE: true,
			PAGINATION: {
				RADIO_STATIONS_LIST: 50,
				RADIO_GENRES_LIST: 50,
				RADIO_LOCATIONS_LIST: 50,
				RADIO_LANGUAGES_LIST: 50
			}
		},
		DISCOGS: {
			USE_IN_APP_CACHE: false,
			BUILD_SEARCH_TRIE: false,
			STORE_SEARCH_TRIE: false,
			PAGINATION: {
				ARTISTS_LIST: 50,
				SONGS_LIST: 100
			}
		},
	},
	
	RADIO_STATIONS_LIST_API_PAGINATION_LIMIT: 50,
	RADIO_GENRES_LIST_API_PAGINATION_LIMIT: 50,
	RADIO_LOCATIONS_LIST_API_PAGINATION_LIMIT: 50,
	RADIO_LANGUAGES_LIST_API_PAGINATION_LIMIT: 50,
	
	ARTIST_LIST_API_PAGINATION_LIMIT: 50,

	NODE_PORT: 8000
}

module.exports.getConstant = function(name) {
	return (constants[name]) ? constants[name] : undefined;
}