define([
    'jquery',
    'underscore',
    'backbone',
    'models/struktogram'
], function($, _, Backbone, Struktogram) {
    var Document = Backbone.Model.extend({
        defaults: {},
        initialize: function() {
            var self = this;
            this.set("helpers", []);
        },
        newStruktogram: function(name) {
            var self = this,
                struktogram = new Struktogram({'name': name, 'document': this});
            this.set("struktogram", struktogram);
            this.get("struktogram").get("sequence").newCommand();
            this.listenTo(this.get("struktogram"), 'change', function(e) {
                self.trigger('change', e);
            });
            return struktogram;
        },
        addHelperStruktogram: function() {
            var self = this,
                helpers = this.get("helpers").map(function(helper) { return helper; }),
                name = this.get("struktogram").get("name") + "_helper" + (helpers.length + 1),
                struktogram = new Struktogram({'name': name, 'helper': true, 'document': this});
            struktogram.get("sequence").newCommand();
            helpers.push(struktogram);
            this.set({
                'helpers': helpers,
                '_updated_at': (new Date()).getTime()
            });
            this.listenTo(struktogram, 'change', function(e) {
                self.trigger('change', e);
            });
            return struktogram;
        },
        removeHelperStruktogram: function(struktogram) {
            var self = this,
                helpers = this.get("helpers").map(function(helper) { return helper; }),
                idx = helpers.indexOf(struktogram);
            if (idx > -1 && idx < helpers.length) {
                var removed = helpers.splice(idx, 1);
                this.stopListening(removed[0]);
                this.set({
                    'helpers': helpers,
                    '_updated_at': (new Date()).getTime()
                });
            }
        },
        toJSON: function() {
            return {
                'struktogram': this.get("struktogram").toJSON(),
                'helpers': this.get("helpers").map(function(helper) { return helper.toJSON(); })
            };
        },
        fromJSON: function(json) {
            var self = this,
                helpers = [],
                struktogram = new Struktogram({'document': this});
            struktogram.fromJSON(json.struktogram);
            json.helpers.map(function(helper_json) {
                var helper = new Struktogram({'document': this});
                helper.fromJSON(helper_json);
                helpers.push(helper);
                self.listenTo(helper, 'change', function(e) {
                    self.trigger('change', e);
                });
            });
            this.listenTo(this.get("struktogram"), 'change', function(e) {
                self.trigger('change', e);
            });
            this.set({
                "struktogram": struktogram,
                "helpers": helpers
            });
        }
    });
    return Document;
});
