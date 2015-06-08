'use strict';
var gulp = require('gulp');
var loadPlugins = require('gulp-load-plugins');
var globs = require('../globs');
var del = require('del');

var plugins = loadPlugins();

gulp.task('clean', function (callback) {
	del(globs.web.assets.compiled, callback);
});
