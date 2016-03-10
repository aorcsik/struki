define([
    "qunit",
    "lib/parser",
    "models/context"
], function(QUnit, Parser, Context) {
    QUnit.module("Parser", function(hooks) {
        var context;

        hooks.beforeEach(function(assert) {
            context = new Context();
            assert.equal(context.get("name"), "global", "create global context");
        });

        hooks.afterEach(function(assert) {
            context = null;
        });

        QUnit.test("Numeric operators", function(assert) {
            assert.equal((new Parser("-1")).evaluate(context), -1, "negative");
            assert.equal((new Parser("1 + 2")).evaluate(context), 3, "addition");
            assert.equal((new Parser("1 - 2")).evaluate(context), -1, "subtraction");
            assert.equal((new Parser("3 * 2")).evaluate(context), 6, "multiplication");
            assert.equal((new Parser("6 / 2")).evaluate(context), 3, "division");
            assert.equal((new Parser("7 % 2")).evaluate(context), 1, "modulo division");
            assert.equal((new Parser("-1 + 2 * 6 - 4 / (4 - (2 + 4) / 3)")).evaluate(context), 9, "precedence");
        });

        QUnit.test("Boolean operators", function(assert) {
            assert.equal((new Parser("I")).evaluate(context), true, "true");
            assert.equal((new Parser("H")).evaluate(context), false, "false");
            assert.equal((new Parser("!I")).evaluate(context), false, "not");
            assert.equal((new Parser("I & H")).evaluate(context), false, "and");
            assert.equal((new Parser("I | H")).evaluate(context), true, "or");
        });

        QUnit.test("Set variable positive number", function(assert) {
            context.defineVariable("a", 0);
            (new Parser("a := 1")).evaluate(context);
            assert.equal(context.getVariable("a"), 1);
        });

        QUnit.test("Set variable negative number", function(assert) {
            context.defineVariable("a", 0);
            (new Parser("a := -1")).evaluate(context);
            assert.equal(context.getVariable("a"), -1);
        });

        QUnit.test("Increment number variable", function(assert) {
            context.defineVariable("a", 0);
            (new Parser("a := a + 1")).evaluate(context);
            assert.equal(context.getVariable("a"), 1);
        });

        QUnit.test("Decrement number variable", function(assert) {
            context.defineVariable("a", 0);
            (new Parser("a := a - 1")).evaluate(context);
            assert.equal(context.getVariable("a"), -1);
        });


    });
});
