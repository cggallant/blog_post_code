#!/bin/bash
emcc add.c -s EXTRA_EXPORTED_RUNTIME_METHODS=['ccall'] -s EXPORT_ES6=1 -s MODULARIZE=1 -s USE_ES6_IMPORT_META=0 -o TestImport.js