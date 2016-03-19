'use strict';
var gulp = require('gulp');
var runSequence = require('run-sequence');
var requireDir = require('require-dir');
requireDir('./gulp/tasks', { recurse: true });

gulp.task('seq-test', function (callback) {
  runSequence('eslint', 'mocha-server', callback);
});
gulp.task('test', function () {
  return gulp.start('eslint-build',
    'mocha-server'
  );
});
gulp.task('build', ['clean'], function (callback) {
  runSequence(['scss', 'browserify'],
    'version', 'gzip',
    callback);
});
gulp.task('default', function () {
  return gulp.start('eslint-build',
    'mocha-server');
});
gulp.task('postdeploy', function () {
  return gulp.start(
    'scss',
    'sprite');
});
