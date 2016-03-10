define([
    "qunit",
    "lib/parser",
    "models/context"
], function(QUnit, Parser, Context) {
    QUnit.module("Parser", function(hooks) {
        var context;

        hooks.beforeEach(function(assert) {
            context = new Context();
            // assert.equal(context.get("name"), "global", "create global context");
        });

        hooks.afterEach(function(assert) {
            context = null;
        });

        QUnit.test("Numeric values", function(assert) {
            assert.equal((new Parser("0")).evaluate(context), 0, "0");
            assert.equal((new Parser("100")).evaluate(context), 100, "100");
            assert.equal((new Parser("-10")).evaluate(context), -10, "-10");
            assert.equal((new Parser("2.34")).evaluate(context), 2.34, "2.34");
            assert.equal((new Parser("-12.3")).evaluate(context), -12.3, "-12.3");
        });
        QUnit.test("Numeric operators", function(assert) {
            assert.equal((new Parser("-1")).evaluate(context), -1, "negative");
            assert.equal((new Parser("1 + 2")).evaluate(context), 3, "addition");
            assert.equal((new Parser("1 - 2")).evaluate(context), -1, "subtraction");
            assert.equal((new Parser("3 * 2")).evaluate(context), 6, "multiplication");
            assert.equal((new Parser("6 / 2")).evaluate(context), 3, "division");
            assert.equal((new Parser("7 % 2")).evaluate(context), 1, "modulo division");
            assert.equal((new Parser("-1 + 2 * 6 - 4 / (-4 * -1 - (2 + 4) / (3))")).evaluate(context), 9, "precedence");
        });

        QUnit.test("Boolean values", function(assert) {
            assert.equal((new Parser("I")).evaluate(context), true, "true");
            assert.equal((new Parser("H")).evaluate(context), false, "false");
        });
        QUnit.test("Boolean operators", function(assert) {
            assert.equal((new Parser("!I")).evaluate(context), false, "not");
            assert.equal((new Parser("I & H")).evaluate(context), false, "and");
            assert.equal((new Parser("I | H")).evaluate(context), true, "or");
            assert.equal((new Parser("I & H | (H | !H)")).evaluate(context), true, "precedence");
        });

        QUnit.test("Arrays", function(assert) {
            assert.deepEqual((new Parser("[]")).evaluate(context), [], "[ ]");
            assert.deepEqual((new Parser("[2]")).evaluate(context), [2], "[ 2 ]");
            assert.deepEqual((new Parser("[2,3,4,5]")).evaluate(context), [2,3,4,5], "[ 2, 3, 4, 5 ]");
            assert.deepEqual((new Parser("[2,3,[4,5]]")).evaluate(context), [2,3,[4,5]], "[ 2, 3, [ 4, 5 ] ]");
        });

        QUnit.test("Array operators", function(assert) {
            assert.deepEqual((new Parser("[] + []")).evaluate(context), [], "[ ] + [ ] = [ ]");
            assert.deepEqual((new Parser("[2] + []")).evaluate(context), [2], "[ 2 ] + [ ] = [ 2 ]");
            assert.deepEqual((new Parser("[2,3] + [4,5]")).evaluate(context), [2,3,4,5], "[ 2, 3 ] + [ 4, 5 ] = [ 2, 3, 4, 5 ]");
        });

        QUnit.test("Array index", function(assert) {
            context.defineVariable("a", [1, [1, 2]]);
            assert.deepEqual((new Parser("a[0]")).evaluate(context), 1, "a[0] = 1");
            assert.deepEqual((new Parser("a[1][1]")).evaluate(context), 2, "a[1][1] = 2");
        });

        QUnit.test("Array push", function(assert) {
            context.defineVariable("a", []);
            (new Parser("a[] := 2")).evaluate(context);
            assert.deepEqual(context.getVariable("a"), [2]);
        });

        QUnit.test("Function call", function(assert) {
            context.defineFunction("test", function() { return Array.prototype.slice.call(arguments); });
            assert.deepEqual((new Parser("test()")).evaluate(context), [], "test()");
            assert.deepEqual((new Parser("test(-1)")).evaluate(context), [-1], "test(-1)");
            assert.deepEqual((new Parser("test(1, (1 + 2) * 3)")).evaluate(context), [1, 9], "test(1, (1 + 2) * 3)");
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
