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
        '../components/requirejs-text/text'],
    jquery: [
        '../components/jquery/dist/jquery'],
    jquery_ui: [
        '../components/jquery-ui/jquery-ui'],
    underscore: [
        '../components/underscore/underscore'],
    backbone: [
        '../components/backbone/backbone'],
    bootstrap: [
        '../components/bootstrap/dist/js/bootstrap'],
    bootstrap_material_design: [
        '../components/bootstrap-material-design/dist/js/material'],
    qunit: [
        '../components/qunit/qunit/qunit'],
    templates: '../' + 'templates'
  },
  shim: {
    underscore: {
      exports: '_'
    },
    backbone: {
      deps: ["underscore", "jquery"],
      exports: "Backbone"
    },
    bootstrap: {
      deps: ["jquery"],
      exports: "jQuery"
    },
    bootstrap_material_design: {
      deps: ["jquery", 'bootstrap'],
      exports: "jQuery"
    },
    qunit: {
      exports: "QUnit"
    }
  },
  urlArgs: __dbv
});

require([
    'jquery',
    'qunit',
    'tests/test_parser'
], function($, QUnit){
    QUnit.config.autostart = false;
    $(function() {
        QUnit.start();
    });
});
