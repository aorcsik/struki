// Author: Thomas Davis <thomasalwyndavis@gmail.com>
// Filename: main.js

var __dbv = "dev" + (new Date()).getTime();

if (window.console === undefined) {
    window.console = {log: function() {}};
}

window.uuid = function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
};

// Require.js allows us to configure shortcut alias
// Their usage will become more apparent futher along in the tutorial.
require.config({
  paths: {
    text: [
        '../../node_modules/requirejs-text/text'],
    jquery: [
        '../../node_modules/jquery/dist/jquery'],
    jquery_ui: [
        '../../node_modules/jquery-ui/dist/jquery-ui'],
    underscore: [
        '../../node_modules/underscore/underscore'],
    backbone: [
        '../../node_modules/backbone/backbone'],
    bootstrap: [
        '../../node_modules/bootstrap/dist/js/bootstrap'],
    bootstrap_material_design: [
        '../../node_modules/bootstrap-material-design/dist/js/material'],
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
    }
  },
  urlArgs: __dbv
});

require([
    'app'
], function(App){
    window.App = new App();
});
