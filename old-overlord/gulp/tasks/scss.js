'use strict';
var gulp = require('gulp');
var path = require('path');
var loadPlugins = require('gulp-load-plugins');
var globs = require('../globs');

var plugins = loadPlugins();

gulp.task('scss', ['sprite'], function () {
  return gulp.src(globs.web.assets.raw.scss)
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.sass({
      includePaths: [
        require('node-reset-scss').includePath,
        path.resolve(process.cwd(), './node_modules/bootstrap-sass/assets/stylesheets')
      ]

    }))
    .pipe(plugins.sourcemaps.write('./maps'))
    .pipe(gulp.dest('lib/web_app/assets/compiled/css')).pipe(plugins.livereload({
      basePath: '/Volumes/Store/Projects/hoist/overlord/lib/web_app/assets/compiled'
    }));
});
