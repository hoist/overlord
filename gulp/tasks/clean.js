'use strict';
var gulp = require('gulp');
var globs = require('../globs');
var del = require('del');


gulp.task('clean', function (callback) {
  del(globs.web.assets.compiled, callback);
});
gulp.task('clean-coverage', function (callback) {
  del('coverage/**/*', callback);
});
