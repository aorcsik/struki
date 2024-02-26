({
    appDir: "../",
    baseUrl: "js",
    dir: "../../docs",
    modules: [{
        name: "main"
    }, {
        name: "test"
    }],
    skipDirOptimize: true,
    optimizeAllPluginResources: true,
    paths: {
        text: "../../node_modules/requirejs-text/text",
        jquery: "../../node_modules/jquery/dist/jquery",
        jquery_ui: "../../node_modules/jquery-ui/dist/jquery-ui",
        underscore: "../../node_modules/underscore/underscore",
        backbone: "../../node_modules/backbone/backbone",
        bootstrap: "../../node_modules/bootstrap/dist/js/bootstrap",
        bootstrap_material_design: "../../node_modules/bootstrap-material-design/dist/js/material",
        qunit: "../../node_modules/qunit/qunit/qunit"
    },
    exclude: []
})
