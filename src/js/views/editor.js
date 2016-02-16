define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone){
    var EditorView = Backbone.View.extend({
        id: "editor",
        events: {},

        initialize: function() {},

        onClose: function() {},

        render: function() { this.$el.html("editor"); return this; }
    });
    return EditorView;
});
