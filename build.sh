#!/bin/sh

# build project
node_modules/requirejs/bin/r.js -o src/js/build.js

# remove not needed files
echo "Removing not needed files..."
ls build/components | grep -v "requirejs" | while read component; do rm -rf "build/components/$component"; done
ls build/js | grep -v "main.js" | grep -v "test.js" | while read component; do rm -rf "build/js/$component"; done
ls build/css | grep -v "main.css" | grep -v "test.css" | while read component; do rm -rf "build/css/$component"; done
rm -rf "build/templates/"
echo "Done"
