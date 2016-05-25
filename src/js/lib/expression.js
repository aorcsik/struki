define(['lib/parse_error', 'lib/compile_error'], function(ParseError, CompileError) {

/** The Expression object */
function Expression(id, operator, params) {
    /** expression id */
    this.id = id;

    /** The type of expression */
    this.operator = operator;

    /** The expression id's of the operands */
    this.params = params;
}

Expression.prototype.isNumber = function(val) {
    return typeof val === "number";
};

Expression.prototype.isString = function(val) {
    return typeof val === "string";
};

Expression.prototype.isBoolean = function(val) {
    return typeof val === "boolean";
};

Expression.prototype.isArray = function(val) {
    return typeof val === "object" && val !== null && val.constructor === Array;
};

/** Evaluates the expression based on it's type and parameteres */
Expression.prototype.evaluate = function(context, expressions, constants) {
    var a, b, c, array_index_expression, keys, value, func, self = this;
    if (this.operator == "expression") {
        return expressions[this.params[0]].evaluate(context, expressions, constants);
    }
    else if (this.operator == "nil") {
        return null;
    }
    else if (this.operator == "bool") {
        return constants[this.params[0]];
    }
    else if (this.operator == "float") {
        return constants[this.params[0]];
    }
    else if (this.operator == "int") {
        return constants[this.params[0]];
    }
    else if (this.operator == "string") {
        return constants[this.params[0]];
    }
    else if (this.operator == "parens") {
        return expressions[this.params[0]].evaluate(context, expressions, constants);
    }
    else if (this.operator == "sum") {
        a = expressions[this.params[0]].evaluate(context, expressions, constants);
        b = expressions[this.params[1]].evaluate(context, expressions, constants);
        if (this.isNumber(a) && typeof this.isNumber(b)) return a + b;
        else if (this.isString(a)) return a + ("" + b);
        else if (this.isArray(a) && this.isArray(b)) return a.concat(b);
        else throw new CompileError("+ operator requires number, string or array operands");
    }
    else if (this.operator == "sub") {
        a = expressions[this.params[0]].evaluate(context, expressions, constants);
        b = expressions[this.params[1]].evaluate(context, expressions, constants);
        if (this.isNumber(a) && typeof this.isNumber(b)) return a - b;
        else throw new CompileError("- operator requires number operands");
    }
    else if (this.operator == "pow") {
        a = expressions[this.params[0]].evaluate(context, expressions, constants);
        b = expressions[this.params[1]].evaluate(context, expressions, constants);
        if (this.isNumber(a) && typeof this.isNumber(b)) return Math.pow(a, b);
        else throw new CompileError("* operator requires number operands");
    }
    else if (this.operator == "mul") {
        a = expressions[this.params[0]].evaluate(context, expressions, constants);
        b = expressions[this.params[1]].evaluate(context, expressions, constants);
        if (this.isNumber(a) && typeof this.isNumber(b)) return a * b;
        else throw new CompileError("* operator requires number operands");
    }
    else if (this.operator == "div") {
        a = expressions[this.params[0]].evaluate(context, expressions, constants);
        b = expressions[this.params[1]].evaluate(context, expressions, constants);
        if (this.isNumber(a) && typeof this.isNumber(b))
            if (b !== 0) return a / b;
            else throw new CompileError("division by zero");
        else throw new CompileError("/ operator requires number operands");
    } else if (this.operator == "mod") {
        a = expressions[this.params[0]].evaluate(context, expressions, constants);
        b = expressions[this.params[1]].evaluate(context, expressions, constants);
        if (this.isNumber(a) && typeof this.isNumber(b))
            if (b !== 0) return a % b;
            else throw new CompileError("division by zero");
        else throw new CompileError("% operator requires number operands");
    }
    else if (this.operator == "rng") {
        a = expressions[this.params[0]].evaluate(context, expressions, constants);
        b = expressions[this.params[1]].evaluate(context, expressions, constants);
        if (this.isNumber(a) && typeof this.isNumber(b)) {
            var i, range = [];
            if (a <= b) for (i = a; i <= b; i++) range.push(i);
            else for (i = a; i >= b; i--) range.push(i);
            return range;
        } else throw new CompileError("% operator requires number operands");
    }
    else if (this.operator == "gt") {
        a = expressions[this.params[0]].evaluate(context, expressions, constants);
        b = expressions[this.params[1]].evaluate(context, expressions, constants);
        if (this.isNumber(a) && typeof this.isNumber(b)) return a > b;
        else throw new CompileError("> operator requires number operands");
    }
    else if (this.operator == "gte") {
        a = expressions[this.params[0]].evaluate(context, expressions, constants);
        b = expressions[this.params[1]].evaluate(context, expressions, constants);
        if (this.isNumber(a) && typeof this.isNumber(b)) return a >= b;
        else throw new CompileError(">= operator requires number operands");
    }
    else if (this.operator == "lt") {
        a = expressions[this.params[0]].evaluate(context, expressions, constants);
        b = expressions[this.params[1]].evaluate(context, expressions, constants);
        if (this.isNumber(a) && typeof this.isNumber(b)) return a < b;
        else throw new CompileError("< operator requires number operands");
    }
    else if (this.operator == "lte") {
        a = expressions[this.params[0]].evaluate(context, expressions, constants);
        b = expressions[this.params[1]].evaluate(context, expressions, constants);
        if (this.isNumber(a) && typeof this.isNumber(b)) return a <= b;
        else throw new CompileError("<= operator requires number operands");
    }
    else if (this.operator == "eq") {
        a = expressions[this.params[0]].evaluate(context, expressions, constants);
        b = expressions[this.params[1]].evaluate(context, expressions, constants);
        if (this.isArray(a) && this.isArray(b)) {
            return JSON.stringify(a) === JSON.stringify(b);
        } else if (typeof a === typeof b) {
            return a === b;
        }
        else throw new CompileError("= operator requires operands of the same type");
    }
    else if (this.operator == "ne") {
        a = expressions[this.params[0]].evaluate(context, expressions, constants);
        b = expressions[this.params[1]].evaluate(context, expressions, constants);
        if (this.isArray(a) && this.isArray(b)) {
            return JSON.stringify(a) !== JSON.stringify(b);
        } else if (typeof a === typeof b) {
            return a !== b;
        }
        else throw new CompileError("!= operator requires operands of the same type");
    }
    else if (this.operator == "and") {
        a = expressions[this.params[0]].evaluate(context, expressions, constants);
        b = expressions[this.params[1]].evaluate(context, expressions, constants);
        if (this.isBoolean(a) && this.isBoolean(b)) return a && b;
        else throw new CompileError("& operator requires boolean operands");
    }
    else if (this.operator == "or") {
        a = expressions[this.params[0]].evaluate(context, expressions, constants);
        b = expressions[this.params[1]].evaluate(context, expressions, constants);
        if (this.isBoolean(a) && this.isBoolean(b)) return a || b;
        else throw new CompileError("| operator requires boolean operands");
    }
    else if (this.operator == "neg") {
        a = expressions[this.params[0]].evaluate(context, expressions, constants);
        if (this.isNumber(a)) return -1 * a;
        else throw new CompileError("- operator requires number operand");
    }
    else if (this.operator == "not") {
        a = expressions[this.params[0]].evaluate(context, expressions, constants);
        if (this.isBoolean(a)) return !a;
        else throw new CompileError("! operator requires boolean operand");
    }
    else if (this.operator == "var") {
        return context.getVariableValue(this.params[0]);
    }
    else if (this.operator == "func") {
        if (expressions[this.params[0]].operator == "var") {
            if (this.params.length == 1) {
                return context.callFunction(expressions[this.params[0]].params[0]);
            } else {
                value = this.evaluateList(expressions[this.params[1]], context, expressions, constants).list;
                return context.callFunction(expressions[this.params[0]].params[0], value);
            }
        }
        throw new CompileError("left operand is not a valid function name");
    }
    else if (this.operator == "array") {
        return this.evaluateList(expressions[this.params[0]], context, expressions, constants).list;
    }
    else if (this.operator == "empty_array") {
        return [];
    }
    else if (this.operator == "list") {
        return this.evaluateList(this, context, expressions, constants);
    }
    else if (this.operator == "array_index") {
        keys = this.evaluateArrayIndex(this, context, expressions, constants);
        return context.getArrayValue(keys);
    }
    else if (this.operator == "in_array") {
        a = expressions[this.params[0]].evaluate(context, expressions, constants);
        b = expressions[this.params[1]].evaluate(context, expressions, constants);
        if (this.isArray(b)) {
            return b.filter(function(item) {
                if (self.isArray(a) && self.isArray(item)) {
                    return JSON.stringify(a) === JSON.stringify(item);
                } else if (typeof a === typeof item) {
                    return a === item;
                }
                return false;
            }).length > 0;
        }
        throw new CompileError("right operand must be an array");
    }
    else if (this.operator == "inc") {
        if (expressions[this.params[0]].operator == "var") {
            a = expressions[this.params[0]].params[0];
            b = expressions[this.params[1]].evaluate(context, expressions, constants);
            c = context.getVariableValue(a);
            if (this.isNumber(c) && this.isNumber(b)) return context.setVariableValue(a, c + b);
            else throw new CompileError("+= operator requires number operands");
        }
        else if (expressions[this.params[0]].operator == "array_index") {
            a = this.evaluateArrayIndex(expressions[this.params[0]], context, expressions, constants);
            b = expressions[this.params[1]].evaluate(context, expressions, constants);
            c = context.getArrayValue(a);
            if (this.isNumber(c) && this.isNumber(b)) return context.setArrayValue(a, c + b);
        }
        throw new CompileError("left operand is not a valid variable, or array index");
    }
    else if (this.operator == "dec") {
        if (expressions[this.params[0]].operator == "var") {
            a = expressions[this.params[0]].params[0];
            b = expressions[this.params[1]].evaluate(context, expressions, constants);
            c = context.getVariableValue(a);
            if (this.isNumber(c) && this.isNumber(b)) return context.setVariableValue(a, c - b);
            else throw new CompileError("+= operator requires number operands");
        }
        else if (expressions[this.params[0]].operator == "array_index") {
            a = this.evaluateArrayIndex(expressions[this.params[0]], context, expressions, constants);
            b = expressions[this.params[1]].evaluate(context, expressions, constants);
            c = context.getArrayValue(a);
            if (this.isNumber(c) && this.isNumber(b)) return context.setArrayValue(a, c - b);
        }
        throw new CompileError("left operand is not a valid variable, or array index");
    }
    else if (this.operator == "set") {
        if (expressions[this.params[0]].operator == "list" || expressions[this.params[1]].operator == "list") {
            var list1 = expressions[this.params[0]], list2;
            if (expressions[this.params[1]].operator == "list") {
                list2 = this.evaluateList(expressions[this.params[1]], context, expressions, constants).list;
            } else {
                list2 = expressions[this.params[1]].evaluate(context, expressions, constants).list;
                if (list2 === undefined) {
                    throw new CompileError("right operand is not a valid list");
                }
            }
            return this.evaluateListSet(list1, list2, context, expressions, constants);
        }
        else if (expressions[this.params[0]].operator == "var") {
            a = expressions[this.params[0]].params[0];
            b = expressions[this.params[1]].evaluate(context, expressions, constants);
            return context.setVariableValue(a, b);
        }
        else if (expressions[this.params[0]].operator == "array_push") {
            value = expressions[this.params[1]].evaluate(context, expressions, constants);
            array_index_expression = expressions[this.params[0]];
            if (expressions[array_index_expression.params[0]].operator == "var") {
                a = expressions[array_index_expression.params[0]].params[0];
                return context.getVariableValue(a).push(value);
            } else if (expressions[array_index_expression.params[0]].operator == "array_index") {
                keys = this.evaluateArrayIndex(expressions[array_index_expression.params[0]], context, expressions, constants);
                return context.getArrayValue(keys).push(value);
            }
        }
        else if (expressions[this.params[0]].operator == "array_index") {
            value = expressions[this.params[1]].evaluate(context, expressions, constants);
            keys = this.evaluateArrayIndex(expressions[this.params[0]], context, expressions, constants);
            return context.setArrayValue(keys, value);
        }
        throw new CompileError("left operand is not a valid variable, list or array index");
    }
    throw new CompileError("cannot use " + this.operator + " operator here");
};

/** Recirsively evaluates a list set expression */
Expression.prototype.evaluateListSet = function(list1, list2, context, expressions, constants) {
    var value, keys, variable;
    if (expressions[list1.params[0]].operator == "list") {
        this.evaluateListSet(expressions[list1.params[0]], list2.slice(0, -1), context, expressions, constants);
    } else if (list2.length != 2) {
        throw new ParseError("invalid list set expression, operand count does not match");
    } else if (expressions[list1.params[0]].operator == "var") {
        variable = expressions[list1.params[0]].params[0];
        value = list2[0];
        context.setVariableValue(variable, value);
    } else if (expressions[list1.params[0]].operator == "array_index") {
        keys = this.evaluateArrayIndex(expressions[list1.params[0]], context, expressions, constants);
        value = list2[0];
        context.setArrayValue(keys, value);
    } else {
        throw new ParseError("invalid list set expression, only variables or array indexes are allowed on the left side");
    }
    if (expressions[list1.params[1]].operator == "var") {
        variable = expressions[list1.params[1]].params[0];
        value = list2[list2.length - 1];
        context.setVariableValue(variable, value);
    } else if (expressions[list1.params[1]].operator == "array_index") {
        keys = this.evaluateArrayIndex(expressions[list1.params[1]], context, expressions, constants);
        value = list2[list2.length - 1];
        context.setArrayValue(keys, value);
    } else {
        throw new ParseError("invalid list set expression, only variables or array indexes are allowed on the left side");
    }
};

/** Recirsively evaluates a list expression */
Expression.prototype.evaluateList = function(list, context, expressions, constants) {
    var sublist, flatlist = [];
    if (list.operator == "list") {
        sublist = this.evaluateList(expressions[list.params[0]], context, expressions, constants);
        sublist.list.forEach(function(item) { flatlist.push(item); });
        sublist = this.evaluateList(expressions[list.params[1]], context, expressions, constants);
        sublist.list.forEach(function(item) { flatlist.push(item); });
    } else {
        flatlist.push(list.evaluate(context, expressions, constants));
    }
    return {'list': flatlist};
};

/** Recirsively evaluates an array index expression */
Expression.prototype.evaluateArrayIndex = function(expression, context, expressions, constants) {
    var keys;
    if (expressions[expression.params[0]].operator == "var") {
        keys = [expressions[expression.params[0]].params[0]];
    } else if (expressions[expression.params[0]].operator == "array_index"){
        keys = this.evaluateArrayIndex(expressions[expression.params[0]], context, expressions, constants);
    } else throw new CompileError("invalid array syntax");
    keys.push(expressions[expression.params[1]].evaluate(context, expressions, constants));
    return keys;
};

    return Expression;
});
