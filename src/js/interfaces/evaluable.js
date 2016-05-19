define([], function(Backbone) {
    var Evaluable = {
        _evaluable: true,
        evaluate: function(context) {
            throw "Not implemented!";
        }
    };
    return Evaluable;
});
