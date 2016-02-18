({
    appDir: "../",
    baseUrl: "js",
    dir: "../../build",
    modules: [{
        name: "main"
    }],
    skipDirOptimize: true,
    optimizeAllPluginResources: true,
    paths: {
        text: "../components/requirejs-text/text",
        jquery: "../components/jquery/dist/jquery",
        jquery_ui: "../components/jquery-ui/jquery-ui",
        underscore: "../components/underscore/underscore",
        backbone: "../components/backbone/backbone",
        bootstrap: "../components/bootstrap/dist/js/bootstrap",
        bootstrap_material_design: "../components/bootstrap-material-design/dist/js/material",
        dropzone: "../components/dropzone/dist/dropzone-amd-module"
    },
    exclude: []
})
