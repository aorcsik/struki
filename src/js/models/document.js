define([
    'jquery',
    'underscore',
    'backbone',
    'models/document/struktogram'
], function($, _, Backbone, Struktogram) {
    var Document = Backbone.Model.extend({
        defaults: {},
        initialize: function() {
            var self = this,
                struktogram = new Struktogram({'name': "main", 'document': this});
            this.set({
                "uuid": uuid(),
                "name": this.get("name") || "new",
                "struktogram": struktogram
            });
            this.get("struktogram").get("sequence").newCommand({'code': "return 0"});
            this.listenTo(this.get("struktogram"), 'change', function(e) {
                self.trigger('change', e);
            });
            this.set("helpers", []);
        },
        newHelper: function() {
            var self = this,
                helpers = this.get("helpers").map(function(helper) { return helper; }),
                name = this.get("struktogram").get("name") + "_helper" + (helpers.length + 1),
                struktogram = new Struktogram({'name': name, 'helper': true, 'document': this});
            struktogram.get("sequence").newCommand({'code': "return 0"});
            helpers.push(struktogram);
            this.set({'helpers': helpers});
            this.listenTo(struktogram, 'change', function(e) {
                self.trigger('change', e);
            });
            return struktogram;
        },
        removeHelper: function(struktogram) {
            var self = this,
                helpers = this.get("helpers").map(function(helper) { return helper; }),
                idx = helpers.indexOf(struktogram);
            if (idx > -1 && idx < helpers.length) {
                var removed = helpers.splice(idx, 1);
                this.stopListening(removed[0]);
                this.set({'helpers': helpers});
            }
        },
        serialize: function() {
            return {
                'uuid': this.get("uuid"),
                'name': this.get("name"),
                'struktogram': this.get("struktogram").serialize(),
                'helpers': this.get("helpers").map(function(helper) { return helper.serialize(); })
            };
        },
        deserialize: function(json) {
            var self = this,
                helpers = [],
                struktogram = new Struktogram({'document': this});
            json.struktogram.name = "main";
            struktogram.deserialize(json.struktogram);
            json.helpers.map(function(helper_json) {
                var helper = new Struktogram({'document': this});
                helper.deserialize(helper_json);
                helpers.push(helper);
                self.listenTo(helper, 'change', function(e) {
                    // console.log("struktogram -> document", e);
                    self.trigger('change', e);
                });
            });
            this.listenTo(struktogram, 'change', function(e) {
                // console.log("struktogram -> document", e);
                self.trigger('change', e);
            });
            this.set({
                "uuid": json.uuid || uuid(),
                "name": json.name || "noname",
                "struktogram": struktogram,
                "helpers": helpers
            });
        },
        evaluate: function(context) {
            var main = this.get("struktogram"),
                parameters = [];
            main.get("parameters").forEach(function(parameter) {
                var value = context.get("variables")[parameter.get("name")];
                if (parameter.get("type") == "Int") {
                    value = parseInt(value, 10);
                } else if (parameter.get("type") == "Bool") {
                    if (value === "I") value = true;
                    else if (value == "H") value = false;
                    else value = Boolean(value);
                } else if (parameter.get("type") == "Float") {
                    value = parseFloat(value);
                } else if (parameter.get("type") == "String") {
                    value = "" + value;
                }
                parameters.push(value);
            });
            return main.evaluate(parameters, context);
        }
    });
    return Document;
});
