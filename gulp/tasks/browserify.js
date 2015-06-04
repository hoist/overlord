'use strict';
var gulp = require('gulp');
var globby = require('globby');
var globs = require('../globs');
var browserify = require('browserify');
var babelify = require('babelify');
var path = require('path');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var loadPlugins = require('gulp-load-plugins');
var throat = require('throat');
var streamToPromise = require('stream-to-promise');
var plugins = loadPlugins();

gulp.task('browserify', function (callback) {
  var files = globby.sync(globs.jsx.views);
  Promise.all(files.map(throat(10, function (file) {

    var b = browserify({
        debug: true,
        transform: babelify.configure({
          optional: ["es7.objectRestSpread"]
        })
      })
      .require(path.resolve(process.cwd(), file), {
        expose: 'view'
      })
      .require('react', {
        expose: 'react'
      })
      .require('react-transmit', {
        expose: 'react-transmit'
      })
      .add(path.resolve(process.cwd(), './lib/web_app/assets/src/javascript/client.js'));
    return streamToPromise(b.bundle()
      .pipe(source(file.replace('lib/web_app/views/', 'templates/').replace('.jsx', '.js')))
      .pipe(buffer())
      .pipe(plugins.sourcemaps.init({
        loadMaps: true
      }))
      .pipe(plugins.uglify())
      .on('error', plugins.util.log)
      .pipe(plugins.sourcemaps.write('./maps', {
        sourceRoot: '/js'
      }))
      .pipe(gulp.dest('lib/web_app/assets/compiled/js')));


  }))).then(function () {
    callback();
  }).catch(function (err) {
    callback(err);
  });
});
