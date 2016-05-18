define([], function() {
    function WatcherError(message) {
        this.message = message;
    }

    WatcherError.prototype.toString = function() {
        return "Watcher Error: " + this.message;
    };

    return WatcherError;
});
