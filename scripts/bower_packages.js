#!/usr/bin/node

var bowerjson = require(__dirname + "/../bower.json");

[]
    .concat(Object.keys(bowerjson.dependencies || []))
    .concat(Object.keys(bowerjson.devDependencies || []))
    .forEach(function(pkg) {
        console.log(pkg);
    })
    
