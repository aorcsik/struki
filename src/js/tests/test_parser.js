define([
    "qunit",
    "lib/parser",
    "lib/parse_error",
    "lib/compile_error",
    "models/context",
    "models/function_wrapper",
    "models/document/struktogram"
], function(QUnit, Parser, ParseError, CompileError, Context, FunctionWrapper, Struktogram) {
    QUnit.module("Parser", function(hooks) {
        var context;

        hooks.beforeEach(function(assert) {
            context = new Context();
            // assert.equal(context.get("name"), "global", "create global context");
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
            ["if", "else", "for", "until", "while", "return", "def"].forEach(function(word) {
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
            assert.equal((new Parser("-1 + 2 * 6 - 4 / (-4 * -1 - (2 + 4) / (3))")).evaluate(context), 9, "precedence");
            assert.equal((new Parser("1 = 1")).evaluate(context), true, "1 = 1");
            assert.equal((new Parser("1 = 1.0")).evaluate(context), true, "1 = 1.0");
            assert.equal((new Parser("1 <> 1.1")).evaluate(context), true, "1 <> 1.1");

            assert.throws(function() {
                (new Parser("1 / 0")).evaluate(context);
            }, new CompileError("division by zero"), "division by zero error");
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
            assert.equal((new Parser("I <> H")).evaluate(context), true, "I <> H");
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
            assert.deepEqual((new Parser("\"abc\" <> \"cba\"")).evaluate(context), true, "\"abc\" <> \"cba\"");
        });

        QUnit.test("String index", function(assert) {
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
            assert.deepEqual((new Parser("[2,3] <> [3,2]")).evaluate(context), true, "[ 2, 3 ] <> [ 3, 2 ]");
            assert.deepEqual((new Parser("3 in [3,2]")).evaluate(context), true, "3 in [ 3, 2 ]");
            assert.deepEqual((new Parser("4 in [3,2]")).evaluate(context), false, "4 in [ 3, 2 ]");
            assert.deepEqual((new Parser("[2, 3] in [[2,3],[4,5]]")).evaluate(context), true, "[ 2, 3 ] in [ [ 2, 3 ], [ 4, 5 ] ]");
        });

        QUnit.test("Array index", function(assert) {
            context.defineVariable("a", "Int**", [1, [1, 2], 2]);
            assert.deepEqual((new Parser("a[0]")).evaluate(context), 1, "a[0] = 1");
            assert.deepEqual((new Parser("a[1][1]")).evaluate(context), 2, "a[1][1] = 2");

            (new Parser("a[0] := a[2]")).evaluate(context);
            assert.deepEqual(context.getVariable("a")[0], 2, "a[0] := a[2]; a[0] = 2");

            assert.throws(function() {
                (new Parser("a[3]")).evaluate(context);
            }, new CompileError("array out of bounds"), "a[3] -> array out of bounds");
        });

        QUnit.test("Array push", function(assert) {
            context.defineVariable("a", "Int*", []);
            (new Parser("a[] := 2")).evaluate(context);
            assert.deepEqual(context.getVariable("a"), [2]);
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

        QUnit.test("Set variable positive number", function(assert) {
            context.defineVariable("a", "Int", 0);
            (new Parser("a := 1")).evaluate(context);
            assert.equal(context.getVariable("a"), 1);
        });

        QUnit.test("Set variable negative number", function(assert) {
            context.defineVariable("a", "Int", 0);
            (new Parser("a := -1")).evaluate(context);
            assert.equal(context.getVariable("a"), -1);
        });

        QUnit.test("Set double varibales", function(assert) {
            context.defineVariable("a", "Int", 0);
            context.defineVariable("b", "Int", 0);
            context.defineVariable("c", "Int*", []);
            (new Parser("a, b := 1, 2")).evaluate(context);
            assert.deepEqual([context.getVariable("a"), context.getVariable("b")], [1, 2], "a, b := 1, 2");
            (new Parser("a, c[0] := 1, 2")).evaluate(context);
            assert.deepEqual([context.getVariable("a"), context.getVariable("c")], [1, [2]], "a, c[0] := 1, 2");
        });

        QUnit.test("Set tuple varibales", function(assert) {
            context.defineVariable("a", "Int", 0);
            context.defineVariable("b", "Int", 0);
            context.defineVariable("c", "Int*", []);
            (new Parser("a, b, c[0] := 1, 2, 3")).evaluate(context);
            assert.deepEqual([context.getVariable("a"), context.getVariable("b"), context.getVariable("c")], [1, 2, [3]], "a, b, c[0] := 1, 2, 3");
        });

        QUnit.test("Increment number variable", function(assert) {
            context.defineVariable("a", "Int", 0);
            (new Parser("a := a + 1")).evaluate(context);
            assert.equal(context.getVariable("a"), 1);
        });

        QUnit.test("Decrement number variable", function(assert) {
            context.defineVariable("a", "Int", 0);
            (new Parser("a := a - 1")).evaluate(context);
            assert.equal(context.getVariable("a"), -1);
        });
    });

    QUnit.module("Context", function(hooks) {
        var context;

        hooks.beforeEach(function(assert) {
            context = new Context();
            // assert.equal(context.get("name"), "global", "create global context");
        });

        hooks.afterEach(function(assert) {
            context = null;
        });

        QUnit.test("Define variable", function(assert) {
            Parser.prototype.reserved_words.forEach(function(word) {
                assert.throws(function() {
                    context.defineVariable(word, "Int", 0);
                }, new CompileError("\"" + word + "\" is a reserved word"),
                    "Compile Error: \"" + word + "\" is a reserved word");
            });

            context.defineVariable("a", "Int", 0);
            assert.throws(function() {
                context.defineVariable("a", "Int", 0);
            }, new CompileError("variable \"a\" is already defined"),
                "Compile Error: variable \"a\" is already defined");
        });

        QUnit.test("Define function", function(assert) {
            Parser.prototype.reserved_words.forEach(function(word) {
                assert.throws(function() {
                    context.defineFunction(word, function() {});
                }, new CompileError("\"" + word + "\" is a reserved word"),
                    "Compile Error: \"" + word + "\" is a reserved word");
            });

            context.defineFunction("a", function() {});
            context.defineFunction("b", new FunctionWrapper(function() {}));
            context.defineFunction("c", new Struktogram());

            assert.throws(function() {
                context.defineFunction("d", "d");
            }, new CompileError("this is not a function"),
                "Compile Error: this is not a function");
        });

        QUnit.test("Set and get number variable", function(assert) {
            context.defineVariable("a", "Int", 0);
            context.setVariable("a", 1);
            assert.equal(context.getVariable("a"), 1, "set integer variable");

            context.setVariable("a", "123abc");
            assert.equal(context.getVariable("a"), 123, "string to integer autocast");

            context.defineVariable("b", "Float", 0);
            context.setVariable("b", "123.45");
            assert.equal(context.getVariable("b"), 123.45, "string to float autocast");

            assert.throws(function() {
                context.setVariable("a", "abc123");
            }, new CompileError("type mismatch, &quot;abc123&quot; is not a number"),
                "Compile Error: type mismatch, &quot;abc123&quot; is not a number");

            assert.throws(function() {
                context.setVariable("a", [123]);
            }, new CompileError("type mismatch, [123] is not a number"),
                "Compile Error: type mismatch, [123] is not a number");
        });

        QUnit.test("Set and get boolean variable", function(assert) {
            context.defineVariable("b", "Bool", true);
            context.setVariable("b", true); assert.equal(context.getVariable("b"), true, "true is true");
            context.setVariable("b", false); assert.equal(context.getVariable("b"), false, "false is false");
            context.setVariable("b", 1); assert.equal(context.getVariable("b"), true, "1 is true");
            context.setVariable("b", 0); assert.equal(context.getVariable("b"), false, "0 is false");
            context.setVariable("b", []); assert.equal(context.getVariable("b"), true, "[] is true");
            context.setVariable("b", ""); assert.equal(context.getVariable("b"), false, "\"\" is false");
            context.setVariable("b", "a"); assert.equal(context.getVariable("b"), true, "\"a\" is true");
        });

        QUnit.test("Set and get string variable", function(assert) {
            context.defineVariable("b", "String", true);
            context.setVariable("b", true); assert.equal(context.getVariable("b"), "true", "true is \"true\"");
            context.setVariable("b", false); assert.equal(context.getVariable("b"), "false", "false is \"false\"");
            context.setVariable("b", 123); assert.equal(context.getVariable("b"), "123", "123 is \"123\"");
            context.setVariable("b", [1, 2, [3, 4]]); assert.equal(context.getVariable("b"), "1,2,3,4", "[ 1, 2, [ 3, 4 ] ] is \"1,2,3,4\"");
            context.setVariable("b", "abc"); assert.equal(context.getVariable("b"), "abc", "\"abc\" is \"abc\"");
        });

        QUnit.test("Set and get array variable", function(assert) {
            context.defineVariable("b", "Array", []);

            assert.throws(function() {
                context.setVariable("b", true);
            }, new CompileError("type mismatch, value is not an Array, but a boolean"),
                "Compile Error: type mismatch, value is not an Array, but a boolean");

            assert.throws(function() {
                context.setVariable("b", 1);
            }, new CompileError("type mismatch, value is not an Array, but a number"),
                "Compile Error: type mismatch, value is not an Array, but a number");

            assert.throws(function() {
                context.setVariable("b", "abc");
            }, new CompileError("type mismatch, value is not an Array, but a string"),
                "Compile Error: type mismatch, value is not an Array, but a string");

            context.setVariable("b", []); assert.deepEqual(context.getVariable("b"), [], "[] is []");
            context.setVariable("b", [1, 2]); assert.deepEqual(context.getVariable("b"), [1, 2], "[ 1, 2 ] is [ 1, 2 ]");
        });

        QUnit.test("Set and get array value", function(assert) {
            context.defineVariable("b", "Array", []);
            context.setArrayValue(["b", 0], 1);
            assert.deepEqual(context.getArrayValue(["b", 0]), 1, "b[0] := 1");

            context.defineVariable("c", "Array", []);
            assert.throws(function() {
                context.getArrayValue(["c", 0]);
            }, new CompileError("array out of bounds"),
                "Compile Error: array out of bounds");

            context.setArrayValue(["c", 0], 1);
            assert.throws(function() {
                context.setArrayValue(["c", 0, 0], 1);
            }, new CompileError("type mismatch, c[0] is not an Array, but a number"),
                "Compile Error: type mismatch, c[0] is not an Array, but a number");

            assert.throws(function() {
                context.getArrayValue(["c", 0, 0]);
            }, new CompileError("type mismatch, c[0] is not an Array, but a number"),
                "Compile Error: type mismatch, c[0] is not an Array, but a number");

            context.defineVariable("d", "Array", [[1]]);
            assert.throws(function() {
                context.getArrayValue(["d", 0, 0, 0]);
            }, new CompileError("type mismatch, d[0][0] is not an Array, but a number"),
                "Compile Error: type mismatch, d[0][0] is not an Array, but a number");
        });
    });
});
