module.exports = function () {
    var ALL_STATIONS = [];
    var cache_set = false;
    return {
        get: function () { return ALL_STATIONS; },
        set: function (val) { ALL_STATIONS = val; cache_set = true; },
        isset: function() { return cache_set; }
    }
}();