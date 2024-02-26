const config = require('./package').config;
const express = require('express')
const app = express()
const port = config.port;

app.use(express.static('src'));
app.use('/node_modules', express.static('node_modules'));
app.use('/js/require.js', express.static('node_modules/requirejs/require.js'));

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
});