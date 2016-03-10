define([
    "qunit",
    "lib/parser"
], function(QUnit, Parser) {
    QUnit.module("Parser");
    QUnit.test( "hello test", function( assert ) {
        assert.ok( 1 == "1", "Passed!" );
    });
});
