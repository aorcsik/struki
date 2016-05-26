define([
    "qunit",
    "lib/parser",
    "lib/parse_error",
    "lib/compile_error",
    "models/context"
], function(QUnit, Parser, ParseError, CompileError, Context) {
    QUnit.module("Expression Parser", function(hooks) {
        var context;

        hooks.beforeEach(function(assert) {
            context = new Context();
        });

        hooks.afterEach(function(assert) {
            context = null;
        });

        QUnit.test("Parse errors", function(assert) {
            assert.throws(function() {
                (new Parser("")).evaluate(context);
            }, new ParseError("no code to parse"), "\"\" -> Parse Error: no code to parse");

            assert.throws(function() {
                (new Parser("2 3")).evaluate(context);
            }, new ParseError("missing operator"), "\"2 3\" -> Parse Error: missing operator");

            assert.throws(function() {
                (new Parser(",,")).evaluate(context);
            }, new ParseError("unresolved tokens 'OPERATOR_LSTOPERATOR_LST'"),
                "\",,\" -> Parse Error: unresolved tokens 'OPERATOR_LSTOPERATOR_LST'");

            assert.throws(function() {
                (new Parser("((())")).evaluate(context);
            }, new ParseError("unmatched parenthesis"),
                "\"((())\" -> Parse Error: unmatched parenthesis");

            assert.throws(function() {
                (new Parser("a[0][")).evaluate(context);
            }, new ParseError("unmatched brackets"),
                "\"a[0][\" -> Parse Error: unmatched brackets");
        });

        QUnit.test("Reserved words", function(assert) {
            var reserved_words = Parser.prototype.reserved_words.filter(function(word) {
                return word !== "_" && word !== "in" && word !== "I" && word !== "H" && word !== "NIL";
            }).forEach(function(word) {
                assert.throws(function() {
                    (new Parser(word)).evaluate(context);
                }, new ParseError("\"" + word + "\" is a reserved word"),
                    "\"" + word + "\" -> Parse Error: \"" + word + "\" is a reserved word");

                context.defineVariable("_" + word, "String", "OK");
                assert.equal((new Parser("_" + word)).evaluate(context), "OK", "\"" + "_" + word + "\" is not reserved");
            });
        });

        QUnit.test("Numeric values", function(assert) {
            assert.equal((new Parser("0")).evaluate(context), 0, "0");
            assert.equal((new Parser("100")).evaluate(context), 100, "100");
            assert.equal((new Parser("-10")).evaluate(context), -10, "-10");
            assert.equal((new Parser("2.34")).evaluate(context), 2.34, "2.34");
            assert.equal((new Parser("-12.3")).evaluate(context), -12.3, "-12.3");

            assert.throws(function() {
                (new Parser("01")).evaluate(context);
            }, new ParseError("missing operator"), "01 is not a valid number");
        });
        QUnit.test("Numeric operators", function(assert) {
            assert.equal((new Parser("-1")).evaluate(context), -1, "negative");
            assert.equal((new Parser("1 + 2")).evaluate(context), 3, "addition");
            assert.equal((new Parser("1 - 2")).evaluate(context), -1, "subtraction");
            assert.equal((new Parser("3 * 2")).evaluate(context), 6, "multiplication");
            assert.equal((new Parser("6 / 2")).evaluate(context), 3, "division");
            assert.equal((new Parser("7 % 2")).evaluate(context), 1, "modulo division");
            assert.equal((new Parser("2 ^ 10")).evaluate(context), 1024, "power");
            assert.equal((new Parser("1 = 1")).evaluate(context), true, "1 = 1");
            assert.equal((new Parser("1 = 1.0")).evaluate(context), true, "1 = 1.0");
            assert.equal((new Parser("1 != 1.1")).evaluate(context), true, "1 != 1.1");

            assert.throws(function() {
                (new Parser("1 / 0")).evaluate(context);
            }, new CompileError("division by zero"), "division by zero error");

            assert.equal((new Parser("-1 + 2 * 6 - 4 / (-4 * -1 - (2 + 4) / (3))")).evaluate(context), 9, "");
        });

        QUnit.test("Boolean values", function(assert) {
            assert.equal((new Parser("I")).evaluate(context), true, "true");
            assert.equal((new Parser("H")).evaluate(context), false, "false");
        });
        QUnit.test("Boolean operators", function(assert) {
            assert.equal((new Parser("!I")).evaluate(context), false, "not");
            assert.equal((new Parser("I & H")).evaluate(context), false, "and");
            assert.equal((new Parser("I | H")).evaluate(context), true, "or");
            assert.equal((new Parser("I & H | !(H | !H)")).evaluate(context), false, "precedence");
            assert.equal((new Parser("I = !H")).evaluate(context), true, "I = !H");
            assert.equal((new Parser("I != H")).evaluate(context), true, "I != H");
        });

        QUnit.test("String values", function(assert) {
            assert.equal((new Parser('""')).evaluate(context), "", '""');
            assert.equal((new Parser('" "')).evaluate(context), " ", '" "');
            assert.equal((new Parser('"1"')).evaluate(context), "1", '"1"');
            assert.equal((new Parser('"1234 abcd"')).evaluate(context), "1234 abcd", '"1234 abcd"');
            assert.equal((new Parser("\"1234 \\\"ab\\\\cd\"")).evaluate(context), "1234 \"ab\\cd", "\"1234 \\\"ab\\\\cd\"");
        });

        QUnit.test("String operators", function(assert) {
            assert.deepEqual((new Parser("\"\" + \"a\"")).evaluate(context), "a", "\"\" + \"a\" = \"a\"");
            assert.deepEqual((new Parser("\"abcd\" + \"\"")).evaluate(context), "abcd", "\"abcd\" + \"\" = \"abcd\"");
            assert.deepEqual((new Parser("\"abc\" = \"abc\"")).evaluate(context), true, "\"abc\" = \"abc\"");
            assert.deepEqual((new Parser("\"abc\" != \"cba\"")).evaluate(context), true, "\"abc\" != \"cba\"");

            context.defineVariable("a", "String", "hello");
            assert.deepEqual((new Parser("a[0]")).evaluate(context), "h", "a[0] = \"h\"");
            assert.deepEqual((new Parser("a[0] + a[1]")).evaluate(context), "he", "a[0] + a[1] = \"he\"");
        });

        QUnit.test("Arrays", function(assert) {
            assert.deepEqual((new Parser("[]")).evaluate(context), [], "[ ]");
            assert.deepEqual((new Parser("[2]")).evaluate(context), [2], "[ 2 ]");
            assert.deepEqual((new Parser("[2,3,4,5]")).evaluate(context), [2,3,4,5], "[ 2, 3, 4, 5 ]");
            assert.deepEqual((new Parser("[2,3,[4,5]]")).evaluate(context), [2,3,[4,5]], "[ 2, 3, [ 4, 5 ] ]");
            assert.deepEqual((new Parser("[\"2\",\"3\",\"4\"]")).evaluate(context), ["2","3","4"], "[ \"2\", \"3\", \"4\" ]");
        });

        QUnit.test("Array operators", function(assert) {
            assert.deepEqual((new Parser("[] + []")).evaluate(context), [], "[ ] + [ ] = [ ]");
            assert.deepEqual((new Parser("[2] + []")).evaluate(context), [2], "[ 2 ] + [ ] = [ 2 ]");
            assert.deepEqual((new Parser("[2,3] + [4,5]")).evaluate(context), [2,3,4,5], "[ 2, 3 ] + [ 4, 5 ] = [ 2, 3, 4, 5 ]");
            assert.deepEqual((new Parser("[2,3] = [2,3]")).evaluate(context), true, "[ 2, 3 ] = [ 2, 3 ]");
            assert.deepEqual((new Parser("[2,3] != [3,2]")).evaluate(context), true, "[ 2, 3 ] != [ 3, 2 ]");
            assert.deepEqual((new Parser("3 in [3,2]")).evaluate(context), true, "3 in [ 3, 2 ]");
            assert.deepEqual((new Parser("4 in [3,2]")).evaluate(context), false, "4 in [ 3, 2 ]");
            assert.deepEqual((new Parser("[2, 3] in [[2,3],[4,5]]")).evaluate(context), true, "[ 2, 3 ] in [ [ 2, 3 ], [ 4, 5 ] ]");

            context.defineVariable("a", "Int**", [1, [1, 2], 2]);
            assert.deepEqual((new Parser("a[0]")).evaluate(context), 1, "a[0] = 1");
            assert.deepEqual((new Parser("a[1][1]")).evaluate(context), 2, "a[1][1] = 2");

            (new Parser("a[0] := a[2]")).evaluate(context);
            assert.deepEqual(context.getVariableValue("a")[0], 2, "a[0] := a[2]; a[0] = 2");

            context.defineVariable("b", "Int*", []);
            (new Parser("b[] := 2")).evaluate(context);
            assert.deepEqual(context.getVariableValue("b"), [2]);
        });

        QUnit.test("Range", function(assert) {
            assert.deepEqual((new Parser("1..1")).evaluate(context), [1], "1..1");
            assert.deepEqual((new Parser("-1..1")).evaluate(context), [-1, 0, 1], "-1..1");
            assert.deepEqual((new Parser("1..-1")).evaluate(context), [1, 0, -1], "1..-1");
            context.defineVariable("a", "Int", 5);
            assert.deepEqual((new Parser("1..a")).evaluate(context), [1, 2, 3, 4, 5], "1..a");
            assert.deepEqual((new Parser("-1..1+[1]")).evaluate(context), [-1, 0, 1, 1], "-1..1 + [1]");
        });

        QUnit.test("Function call", function(assert) {
            context.defineFunction("test", function() { return Array.prototype.slice.call(arguments); });
            assert.deepEqual((new Parser("test()")).evaluate(context), [], "test()");
            assert.deepEqual((new Parser("test(-1)")).evaluate(context), [-1], "test(-1)");
            assert.deepEqual((new Parser("test(1, (1 + 2) * 3)")).evaluate(context), [1, 9], "test(1, (1 + 2) * 3)");
        });

        QUnit.test("Setting variables", function(assert) {
            context.defineVariable("a", "Int", 0);
            (new Parser("a := 1")).evaluate(context);
            assert.equal(context.getVariableValue("a"), 1);

            (new Parser("a := -1")).evaluate(context);
            assert.equal(context.getVariableValue("a"), -1);

            context.defineVariable("b", "Int", 0);
            context.defineVariable("c", "Int*", []);
            (new Parser("a, b := 1, 2")).evaluate(context);
            assert.deepEqual([context.getVariableValue("a"), context.getVariableValue("b")], [1, 2], "a, b := 1, 2");
            (new Parser("a, c[0] := 1, 2")).evaluate(context);
            assert.deepEqual([context.getVariableValue("a"), context.getVariableValue("c")], [1, [2]], "a, c[0] := 1, 2");

            context.defineVariable("d", "Int*", []);
            (new Parser("a, b, d[0] := 1, 2, 3")).evaluate(context);
            assert.deepEqual([context.getVariableValue("a"), context.getVariableValue("b"), context.getVariableValue("d")], [1, 2, [3]], "a, b, d[0] := 1, 2, 3");

            assert.throws(function() {
                (new Parser("a, b := 1, 2, 3")).evaluate(context);
            }, new ParseError("invalid list set expression, operand count does not match"),
                "Parse Error: invalid list set expression, operand count does not match");

            assert.throws(function() {
                (new Parser("a, b, c[0] := 1, 2")).evaluate(context);
            }, new ParseError("invalid list set expression, operand count does not match"),
                "Parse Error: invalid list set expression, operand count does not match");
        });

        QUnit.test("Increment and decrement number", function(assert) {
            context.defineVariable("a", "Int", 0);
            (new Parser("a := a + 1")).evaluate(context);
            assert.equal(context.getVariableValue("a"), 1, "a := a + 1");
            (new Parser("a += 1")).evaluate(context);
            assert.equal(context.getVariableValue("a"), 2, "a += 1");

            context.defineVariable("b", "Int*", [0]);
            (new Parser("b[0] := b[0] + 1")).evaluate(context);
            assert.deepEqual(context.getVariableValue("b"), [1], "b[0] := b[0] + 1");
            (new Parser("b[0] += 1")).evaluate(context);
            assert.deepEqual(context.getVariableValue("b"), [2], "b[0] += 1");

            (new Parser("a := a - 1")).evaluate(context);
            assert.equal(context.getVariableValue("a"), 1, "a := a - 1");
            (new Parser("a -= 1")).evaluate(context);
            assert.equal(context.getVariableValue("a"), 0, "a -= 1");

            (new Parser("b[0] := b[0] - 1")).evaluate(context);
            assert.deepEqual(context.getVariableValue("b"), [1], "b[0] := b[0] - 1");
            (new Parser("b[0] -= 1")).evaluate(context);
            assert.deepEqual(context.getVariableValue("b"), [0], "b[0] -= 1");
        });
    });
});
