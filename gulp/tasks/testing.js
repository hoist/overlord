'use strict';
var mocha = require('@hoist/gulp-mocha');
var gulp = require('gulp');
var path = require('path');
var loadPlugins = require('gulp-load-plugins');
var globs = require('../globs');
var helpers = require('../helpers');
var isparta = require('isparta');
var notifierReporter = require('mocha-notifier-reporter');

var plugins = loadPlugins();

function runMocha(options) {
  options = options || {};
  options.require = options.require || [];
  options.require = options.require.concat([path.resolve(__dirname, '../../tests/bootstrap.js')]);
  options.reporter = options.reporter || notifierReporter.decorate('spec');
  return gulp.src(globs.specs, {
      read: false
    })
    .pipe(plugins.plumber({
      errorHandler: helpers.errorHandler
    }))
    .pipe(mocha(options));
}

gulp.task('mocha-server', ['eslint'], function (cb) {
  require("babel/register")({
    optional: ['es7.objectRestSpread']
  });
  console.log('globs:', globs.js.lib);
  gulp.src(globs.js.lib)
    .pipe(plugins.istanbul({
      instrumenter: isparta.Instrumenter
    }))
    .pipe(plugins.istanbul.hookRequire())
    .on('finish', function () {
      runMocha()
        .pipe(plugins.istanbul.writeReports())
        .on('end', cb);
    });
});
gulp.task('mocha-server-without-coverage', ['eslint'], function () {
  require("babel/register")({
    optional: ['es7.objectRestSpread']
  });
  return runMocha();
});
gulp.task('mocha-server-continue', ['eslint'], function (cb) {
  require("babel/register")({
    optional: ['es7.objectRestSpread']
  });
  gulp.src(globs.js.lib)
    .pipe(plugins.plumber({
      errorHandler: helpers.errorHandler
    }))
    .pipe(plugins.istanbul({
      instrumenter: isparta.Instrumenter
    }))
    .pipe(plugins.istanbul.hookRequire())
    .on('finish', function () {
      require("babel/register")({
        optional: ['es7.objectRestSpread']
      });
      runMocha()
        .pipe(plugins.istanbul.writeReports())
        .pipe(plugins.istanbul.enforceThresholds({ thresholds: { global: 80 } }))
        .on('end', cb);
    });
});
