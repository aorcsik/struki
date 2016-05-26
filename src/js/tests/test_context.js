define([
    "qunit",
    "lib/parser",
    "lib/compile_error",
    "models/ui",
    "models/context",
    "models/function_wrapper",
    "models/document/struktogram"
], function(QUnit, Parser, CompileError, UI, Context, FunctionWrapper, Struktogram) {
    QUnit.module("Context", function(hooks) {
        var context;

        hooks.beforeEach(function(assert) {
            context = new Context({'parent': new UI()});
        });

        hooks.afterEach(function(assert) {
            context = null;
        });

        QUnit.test("Step State Exceptions", function(assert) {
            context.set({"_debug": 3, "_state": 2});
            context.get("parent").set({'max_iterations': 4, "unsafe": false});
            assert.throws(function() { context.stepState(); }, new context.DebugStopException(), "Debug Stop");
            context.set({"_debug": 5});
            assert.throws(function() { context.stepState(); }, new context.UnsafeException(), "Unsafe Stop");
            context.get("parent").set("unsafe", true);
            assert.throws(function() { context.stepState(); }, new context.DebugStopException(), "No Unsafe stop when disabled");
        });

        QUnit.test("Values as String", function(assert) {
            assert.equal(context.asString(true), "I", "Bool: I");
            assert.equal(context.asString(false), "H", "Bool: H");
            assert.equal(context.asString(1), "1", "Integer: 1");
            assert.equal(context.asString([1]), "[1]", "Array: [1]");
            assert.equal(context.asString([1,2]), "[1, 2]", "Array: [1, 2]");
            assert.equal(context.asString("\"x\""), "&quot;\\&quot;x\\&quot;&quot;", "String: \"x\"");
            assert.equal(context.asString({'list': [1,2]}), "1, 2", "List: 1, 2");
            assert.equal(context.asString(null), "NIL", "Null: NIL");
        });

        QUnit.test("Define variable", function(assert) {
            Parser.prototype.reserved_words.forEach(function(word) {
                assert.throws(function() {
                    context.defineVariable(word, "Int", 0);
                }, new CompileError("\"" + word + "\" is a reserved word"),
                    "Compile Error: \"" + word + "\" is a reserved word");
            });

            assert.throws(function() {
                context.getVariableValue("a");
            }, new CompileError("undefined variable \"a\""),
                "Compile Error: undefined variable \"a\"");

            context.defineVariable("a", "Int", 0);
            assert.throws(function() {
                context.defineVariable("a", "Int", 0);
            }, new CompileError("variable \"a\" is already defined"),
                "Compile Error: variable \"a\" is already defined");

            assert.equal(context.getVariableValue("a"), 0, "a is 0");

            context.deleteVariable("a");
            assert.throws(function() {
                context.getVariableValue("a");
            }, new CompileError("undefined variable \"a\""),
                "Compile Error: undefined variable \"a\"");
        });

        QUnit.test("Set and get sink variable", function(assert) {
            context.setVariableValue("_", 1, "No error on set");
            assert.throws(function() {
                context.getVariableValue("_");
            }, new CompileError("_ has no value"),
                "Compile Error: _ has no value");
        });

        QUnit.test("Set and get number variable", function(assert) {
            context.defineVariable("a", "Int", 0);
            context.setVariableValue("a", 1);
            assert.equal(context.getVariableValue("a"), 1, "set integer variable");

            context.setVariableValue("a", "123abc");
            assert.equal(context.getVariableValue("a"), 123, "string to integer autocast");

            context.defineVariable("b", "Float", 0);
            context.setVariableValue("b", "123.45");
            assert.equal(context.getVariableValue("b"), 123.45, "string to float autocast");

            assert.throws(function() {
                context.setVariableValue("a", "abc123");
            }, new CompileError("type mismatch, &quot;abc123&quot; is not a number"),
                "Compile Error: type mismatch, &quot;abc123&quot; is not a number");

            assert.throws(function() {
                context.setVariableValue("a", [123]);
            }, new CompileError("type mismatch, [123] is not a number"),
                "Compile Error: type mismatch, [123] is not a number");
        });

        QUnit.test("Set and get boolean variable", function(assert) {
            context.defineVariable("b", "Bool", true);
            context.setVariableValue("b", true); assert.equal(context.getVariableValue("b"), true, "true is true");
            context.setVariableValue("b", false); assert.equal(context.getVariableValue("b"), false, "false is false");
            context.setVariableValue("b", 1); assert.equal(context.getVariableValue("b"), true, "1 is true");
            context.setVariableValue("b", 0); assert.equal(context.getVariableValue("b"), false, "0 is false");
            context.setVariableValue("b", []); assert.equal(context.getVariableValue("b"), true, "[] is true");
            context.setVariableValue("b", ""); assert.equal(context.getVariableValue("b"), false, "\"\" is false");
            context.setVariableValue("b", "a"); assert.equal(context.getVariableValue("b"), true, "\"a\" is true");
        });

        QUnit.test("Set and get string variable", function(assert) {
            context.defineVariable("b", "String", true);
            context.setVariableValue("b", true); assert.equal(context.getVariableValue("b"), "true", "true is \"true\"");
            context.setVariableValue("b", false); assert.equal(context.getVariableValue("b"), "false", "false is \"false\"");
            context.setVariableValue("b", 123); assert.equal(context.getVariableValue("b"), "123", "123 is \"123\"");
            context.setVariableValue("b", [1, 2, [3, 4]]); assert.equal(context.getVariableValue("b"), "1,2,3,4", "[ 1, 2, [ 3, 4 ] ] is \"1,2,3,4\"");
            context.setVariableValue("b", "abc"); assert.equal(context.getVariableValue("b"), "abc", "\"abc\" is \"abc\"");
        });

        QUnit.test("Set and get array variable", function(assert) {
            context.defineVariable("b", "Array", []);

            assert.throws(function() {
                context.setVariableValue("b", true);
            }, new CompileError("type mismatch, value is not an Array, but a boolean"),
                "Compile Error: type mismatch, value is not an Array, but a boolean");

            assert.throws(function() {
                context.setVariableValue("b", 1);
            }, new CompileError("type mismatch, value is not an Array, but a number"),
                "Compile Error: type mismatch, value is not an Array, but a number");

            assert.throws(function() {
                context.setVariableValue("b", "abc");
            }, new CompileError("type mismatch, value is not an Array, but a string"),
                "Compile Error: type mismatch, value is not an Array, but a string");

            context.setVariableValue("b", []); assert.deepEqual(context.getVariableValue("b"), [], "[] is []");
            context.setVariableValue("b", [1, 2]); assert.deepEqual(context.getVariableValue("b"), [1, 2], "[ 1, 2 ] is [ 1, 2 ]");
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
            }, new CompileError("this is not a callable"),
                "Compile Error: this is not a callable");
        });

        QUnit.test("Call function", function(assert) {
            context.defineVariable("b", "Int", 1);
            context.defineFunction("a", function(varname) {
                return this.getVariableValue(varname);
            });
            assert.equal(context.callFunction("a", ["b"]), 1, "wrapped function has context as this");
        });

        QUnit.test("Evaluate code expression", function(assert) {
            assert.equal(context.evaluateCode("1 + 2"), null, "no return value");
            assert.equal(context.evaluateCode("1 + 2", true), 3, "explicit return");
            assert.equal(context.evaluateCode("return 1 + 2"), 3, "implicit return");
        });

        QUnit.test("Evaluate range expression", function(assert) {
            assert.throws(function() {
                context.evaluateRange("1 := [1,2,3]");
            }, new CompileError("invalid range expression"),
                "Compile Error: invalid range expression");

            assert.throws(function() {
                context.evaluateRange("b := 3");
            }, new CompileError("invalid range expression"),
                "Compile Error: invalid range expression");

            assert.throws(function() {
                context.evaluateRange("b := [1,2,3]");
            }, new CompileError("undefined variable \"b\""),
                "Compile Error: undefined variable \"b\"");

            context.defineVariable("a", "Int", 0);
            assert.deepEqual(context.evaluateRange("a := [1,2,3]"), {'var': "a", 'elements': [2,3], 'ok': true}, "valid range expression");
            assert.equal(context.getVariableValue("a"), 1, "first element: 1");
            assert.deepEqual(context.evaluateRange("a := [1]"), {'var': "a", 'elements': [], 'ok': true}, "valid range expression");
            assert.equal(context.getVariableValue("a"), 1, "first element: 1");
            assert.deepEqual(context.evaluateRange("a := []"), {'var': "a", 'elements': [], 'ok': false}, "empty range expression");
        });
    });
});
