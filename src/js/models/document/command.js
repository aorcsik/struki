define([
    'models/document/abstract_element'
], function(AbstractElement) {
    var Command = AbstractElement.extend({
        _type: "command",
        _new: false,
        defaults: {
            'code': ""
        },

        getCode: function() {
            return this.get("code");
        },

        serialize: function() {
            return {
                'type': this._type,
                'code': this.getCode()
            };
        },
        deserialize: function(json) {
            if (json.type && json.type === this._type) {
                this.set({"code": json.code});
            }
        },

        evaluate: function(context) {
            return this.evaluateCode(context, this.getCode());
        }
    });
    return Command;
});
