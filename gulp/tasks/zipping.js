'use strict';
var gulp = require('gulp');
var loadPlugins = require('gulp-load-plugins');
var globs = require('../globs');
var del = require('del');

var plugins = loadPlugins();

gulp.task('clean-gzipped', function (callback) {
	del(['lib/web_app/assets/compiled/**/*.gz'], callback);
});
gulp.task('gzip', ['clean-gzipped'], function () {
	return gulp.src(globs.web.assets.compiled.concat(['!**/*.map']))
		.pipe(plugins.gzip())
		.pipe(gulp.dest('lib/web_app/assets/compiled'));
});
