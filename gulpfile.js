var gulp = require('gulp');
var path = require('path');
var child_process = require("child_process");
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var exec = require('child_process').exec;
var plumber = require('gulp-plumber');
var neat = require('node-neat').includePaths;

var paths = {
  js: ["./www/js/**/*.js"]
};

gulp.task("default", ["scripts"]);

gulp.task("sass", function() {
    gulp
        .src([
            "www/sass/*.scss"
        ])
        .pipe(plumber())
        .pipe(sass({
            includePaths: ['styles'].concat(neat)
        }))
        .pipe(gulp.dest("www/compiled/css/"))
    ;
});

gulp.task("watch", function() {
    var watch = require("gulp-watch");

    gulp.start("scripts");
    gulp.start("sass");

    watch(paths.js, function() {
        gulp.start("scripts");
    });

    watch("www/sass/**/*", function() {
        gulp.start("sass");
    });

});

gulp.task("jshint", function() {
    var jshint = require("gulp-jshint");

    return gulp.src(paths.js)
        .pipe(jshint())
        .pipe(jshint.reporter())
        .pipe(jshint.reporter("fail"));
});

gulp.task("scripts-runtime", function() {
    var concat = require("gulp-concat");

    return gulp.src([
        "www/js/radiobot/**/*.js",
        "!www/js/radiobot/**/*e2e-spec.js",
        "!www/js/radiobot/**/*_test.js"
    ])
        .pipe(concat("radiobot.js"))
        .pipe(gulp.dest("www/compiled"));
});

gulp.task("scripts-unittest", function() {
    var concat = require("gulp-concat");

    return gulp.src([
        "www/js/spark/**/*_test.js"
    ])
        .pipe(concat("spark_test.js"))
        .pipe(gulp.dest("www/compiled"));
});

gulp.task("scripts", ["jshint", "scripts-runtime", "scripts-unittest"], function(done) {
    done(); // just a convenience task
});
