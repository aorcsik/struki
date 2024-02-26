#!/bin/sh

# build project
node_modules/requirejs/bin/r.js -o src/js/build.js
cp node_modules/requirejs/require.js docs/js/require.js

# remove not needed files
echo "Removing not needed files..."
rm -rf "docs/build.txt";
rm -rf "docs/components";
ls docs/js | grep -v "main.js" | grep -v "test.js" | grep -v "require.js" | while read component; do rm -rf "docs/js/$component"; done
ls docs/css | grep -v "main.css" | grep -v "test.css" | while read component; do rm -rf "docs/css/$component"; done
rm -rf "docs/templates/"
echo "Done"
