define([
    'backbone',
    'interfaces/evaluable',
    'interfaces/serializable'
], function(Backbone, Evaluable, Serializable) {
    var AbstractElement = Backbone.Model.extend(Evaluable).extend(Serializable).extend({
        _type: null,
        _new: false,
        getDocument: function() {
            return this._type === "document" ? this : this.get("parent").getDocument();
        },
        evaluateCode: function(context, code) {
            try {
                return context.evaluateCode(code);
            } catch (e) {
                if (context.isError(e)) this.trigger("errorstop", this);
                if (context.isStop(e)) this.trigger("debugstop", this);
                throw e;
            }
        }
    });
    return AbstractElement;
});
