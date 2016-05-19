define([], function(Backbone) {
    var Serializable = {
        _serializable: true,
        serialize: function() {
            throw "Not implemented!";
        },
        deserialize: function(json) {
            throw "Not implemented!";
        }
    };
    return Serializable;
});
