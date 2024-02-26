// Author: Thomas Davis <thomasalwyndavis@gmail.com>
// Filename: main.js

var __dbv = "dev" + (new Date()).getTime();

if (window.console === undefined) {
    window.console = {log: function() {}};
}

// Require.js allows us to configure shortcut alias
// Their usage will become more apparent futher along in the tutorial.
require.config({
  paths: {
    text: [
        '../../node_modules/requirejs-text/text'],
    jquery: [
        '../../node_modules/jquery/dist/jquery'],
    underscore: [
        '../../node_modules/underscore/underscore'],
    backbone: [
        '../../node_modules/backbone/backbone'],
    qunit: [
        '../../node_modules/qunit/qunit/qunit'],
    templates: '../' + 'templates'
  },
  shim: {
    qunit: {
      exports: "QUnit"
    }
  },
  urlArgs: __dbv
});

require([
    'jquery',
    'qunit',
    'tests/test_context',
    'tests/test_expression_parser'
], function($, QUnit){
    QUnit.config.autostart = false;
    $(function() {
        QUnit.start();
    });
});
