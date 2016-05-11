define([], function() {
    function CompileError(message) {
        this.message = message;
    }

    CompileError.prototype.toString = function() {
        return "Compile Error: " + this.message;
    };

    return CompileError;
});
