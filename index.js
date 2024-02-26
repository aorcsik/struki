const config = require('./package').config;
const express = require('express')
const app = express()
const port = config.port;

app.use(express.static('.'));

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
});