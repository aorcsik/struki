define([], function() {
    function ParseError(message) {
        this.message = message;
    }

    ParseError.prototype.toString = function() {
        return "Parse Error: " + this.message;
    };

    return ParseError;
});
