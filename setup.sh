#!/bin/sh

npm install

node_modules/bower/bin/bower update

cp src/components/requirejs/require.js src/js/require.js
