#!/usr/bin/node

var packagejson = require(__dirname + "/../package.json");

[]
    .concat(Object.keys(packagejson.dependencies || []))
    .concat(Object.keys(packagejson.devDependencies || []))
    .forEach(function(pkg) {
        console.log(pkg);
    })
    
