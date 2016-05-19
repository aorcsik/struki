define([], function(Backbone) {
    var Callable = {
        _callable: true,
        evaluate: function(context) {
            throw "Not implemented!";
        }
    };
    return Callable;
});
