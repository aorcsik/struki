define([], function() {

function Expression(id, operator, params) {
    this.id = id;
    this.operator = operator;
    this.params = params;
}

Expression.prototype.evaluate = function(context, expressions, constants) {
    var a, b, c, array_index_expression, keys, value, func;
    if (this.operator == "expression") {
        return expressions[this.params[0]].evaluate(context, expressions, constants);
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
    else if (this.operator == "sum") {
        a = expressions[this.params[0]].evaluate(context, expressions, constants);
        b = expressions[this.params[1]].evaluate(context, expressions, constants);
        if (typeof a === "number" && typeof b === "number") return a + b;
        else if (a.constructor === Array && b.constructor === Array) return a.concat(b);
        else if (a.constructor === String && b.constructor === String) return a + b;
        else throw "Compile Error: + operator requires number, char, string or array operands";
    }
    else if (this.operator == "sub") {
        a = expressions[this.params[0]].evaluate(context, expressions, constants);
        b = expressions[this.params[1]].evaluate(context, expressions, constants);
        if (typeof a === "number" && typeof b === "number") return a - b;
        else throw "Compile Error: - operator requires number operands";
    }
    else if (this.operator == "mul") {
        a = expressions[this.params[0]].evaluate(context, expressions, constants);
        b = expressions[this.params[1]].evaluate(context, expressions, constants);
        if (typeof a === "number" && typeof b === "number") return a * b;
        else throw "Compile Error: * operator requires number operands";
    }
    else if (this.operator == "div") {
        a = expressions[this.params[0]].evaluate(context, expressions, constants);
        b = expressions[this.params[1]].evaluate(context, expressions, constants);
        if (typeof a === "number" && typeof b === "number")
            if (b !== 0) return a / b;
            else throw "Compile Error: division by zero";
        else throw "Compile Error: / operator requires number operands";
    } else if (this.operator == "mod") {
        a = expressions[this.params[0]].evaluate(context, expressions, constants);
        b = expressions[this.params[1]].evaluate(context, expressions, constants);
        if (typeof a === "number" && typeof b === "number")
            if (b !== 0) return a % b;
            else throw "Compile Error: division by zero";
        else throw "Compile Error: % operator requires number operands";
    }
    else if (this.operator == "rng") {
        a = expressions[this.params[0]].evaluate(context, expressions, constants);
        b = expressions[this.params[1]].evaluate(context, expressions, constants);
        if (typeof a === "number" && typeof b === "number") {
            var i, range = [];
            if (a <= b) for (i = a; i <= b; i++) range.push(i);
            else for (i = a; i >= b; i--) range.push(i);
            return range;
        } else throw "Compile Error: % operator requires number operands";
    }
    else if (this.operator == "gt") {
        a = expressions[this.params[0]].evaluate(context, expressions, constants);
        b = expressions[this.params[1]].evaluate(context, expressions, constants);
        if (typeof a === "number" && typeof b === "number") return a > b;
        else throw "Compile Error: > operator requires number operands";
    }
    else if (this.operator == "gte") {
        a = expressions[this.params[0]].evaluate(context, expressions, constants);
        b = expressions[this.params[1]].evaluate(context, expressions, constants);
        if (typeof a === "number" && typeof b === "number") return a >= b;
        else throw "Compile Error: >= operator requires number operands";
    }
    else if (this.operator == "lt") {
        a = expressions[this.params[0]].evaluate(context, expressions, constants);
        b = expressions[this.params[1]].evaluate(context, expressions, constants);
        if (typeof a === "number" && typeof b === "number") return a < b;
        else throw "Compile Error: < operator requires number operands";
    }
    else if (this.operator == "lte") {
        a = expressions[this.params[0]].evaluate(context, expressions, constants);
        b = expressions[this.params[1]].evaluate(context, expressions, constants);
        if (typeof a === "number" && typeof b === "number") return a <= b;
        else throw "Compile Error: <= operator requires number operands";
    }
    else if (this.operator == "eq") {
        a = expressions[this.params[0]].evaluate(context, expressions, constants);
        b = expressions[this.params[1]].evaluate(context, expressions, constants);
        if (typeof a === typeof b) return a == b;
        else throw "Compile Error: = operator requires operands of the same type";
    }
    else if (this.operator == "ne") {
        a = expressions[this.params[0]].evaluate(context, expressions, constants);
        b = expressions[this.params[1]].evaluate(context, expressions, constants);
        if (typeof a === typeof b) return a != b;
        else throw "Compile Error: <> operator requires operands of the same type";
    }
    else if (this.operator == "and") {
        a = expressions[this.params[0]].evaluate(context, expressions, constants);
        b = expressions[this.params[1]].evaluate(context, expressions, constants);
        if (typeof a === "boolean" && typeof b === "boolean") return a && b;
        else throw "Compile Error: & operator requires boolean operands";
    }
    else if (this.operator == "or") {
        a = expressions[this.params[0]].evaluate(context, expressions, constants);
        b = expressions[this.params[1]].evaluate(context, expressions, constants);
        if (typeof a === "boolean" && typeof b === "boolean") return a || b;
        else throw "Compile Error: | operator requires boolean operands";
    }
    else if (this.operator == "neg") {
        a = expressions[this.params[0]].evaluate(context, expressions, constants);
        if (typeof a === "number") return -1 * a;
        else throw "Compile Error: - operator requires number operand";
    }
    else if (this.operator == "not") {
        a = expressions[this.params[0]].evaluate(context, expressions, constants);
        if (typeof a === "boolean") return !a;
        else throw "Compile Error: ! operator requires boolean operand";
    }
    else if (this.operator == "var") {
        return context.getVariable(this.params[0]);
    }
    else if (this.operator == "func") {
        if (expressions[this.params[0]].operator == "var") {
            if (this.params.length == 1) {
                return context.applyFunction(expressions[this.params[0]].params[0]);
            } else {
                value = this.evaluateList(expressions[this.params[1]], context, expressions, constants).list;
                return context.applyFunction(expressions[this.params[0]].params[0], value);
            }
        }
        throw "Syntax Error: left operand is not a valid function name";
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
    else if (this.operator == "set") {
        if (expressions[this.params[0]].operator == "var") {
            a = expressions[this.params[0]].params[0];
            b = expressions[this.params[1]].evaluate(context, expressions, constants);
            return context.setVariable(a, b);
        }
        else if (expressions[this.params[0]].operator == "array_push") {
            value = expressions[this.params[1]].evaluate(context, expressions, constants);
            array_index_expression = expressions[this.params[0]];
            if (expressions[array_index_expression.params[0]].operator == "var") {
                a = expressions[array_index_expression.params[0]].params[0];
                return context.getVariable(a).push(value);
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
        else if (expressions[this.params[0]].operator == "list") {
            var list1 = expressions[this.params[0]], list2;
            if (expressions[this.params[1]].operator == "list") {
                list2 = this.evaluateList(expressions[this.params[1]], context, expressions, constants).list;
            } else {
                list2 = expressions[this.params[1]].evaluate(context, expressions, constants).list;
                if (list2 === undefined) {
                    throw "Syntax Error: right operand is not a valid list";
                }
            }
            return this.evaluateListSet(list1, list2, context, expressions, constants);
        }
        throw "Syntax Error: left operand is not a valid variable, list or array syntax";
    }
    throw "Syntax Error: cannot use " + this.operator + " operator here";
};

Expression.prototype.evaluateListSet = function(list1, list2, context, expressions, constants) {
    var value, keys, variable;
    if (expressions[list1.params[0]].operator == "list") {
        this.evaluateListSet(expressions[list1.params[0]], list2.slice(0, -1), context, expressions, constants);
    } else if (list2.length > 2) {
        throw "Syntax Error: invalid list set expression, operand count does not match";
    } else if (expressions[list1.params[0]].operator == "var") {
        variable = expressions[list1.params[0]].params[0];
        value = list2[0];
        context.setVariable(variable, value);
    } else if (expressions[list1.params[0]].operator == "array_index") {
        keys = this.evaluateArrayIndex(expressions[list1.params[0]], context, expressions, constants);
        value = list2[0];
        context.setArrayValue(keys, value);
    } else {
        throw "Syntax Error: invalid list set expression, only variables or list indexes are allowed on the left side";
    }
    if (expressions[list1.params[1]].operator == "var") {
        variable = expressions[list1.params[1]].params[0];
        value = list2[list2.length - 1];
        context.setVariable(variable, value);
    } else if (expressions[list1.params[1]].operator == "array_index") {
        keys = this.evaluateArrayIndex(expressions[list1.params[1]], context, expressions, constants);
        value = list2[list2.length - 1];
        context.setArrayValue(keys, value);
    } else {
        throw "Syntax Error: invalid list set expression, only variables or list indexes are allowed on the left side";
    }
};

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

Expression.prototype.evaluateArrayIndex = function(expression, context, expressions, constants) {
    var keys;
    if (expressions[expression.params[0]].operator == "var") {
        keys = [expressions[expression.params[0]].params[0]];
    } else if (expressions[expression.params[0]].operator == "array_index"){
        keys = this.evaluateArrayIndex(expressions[expression.params[0]], context, expressions, constants);
    } else throw "Syntax Error: bad array syntax";
    keys.push(expressions[expression.params[1]].evaluate(context, expressions, constants));
    return keys;
};

    return Expression;
});
