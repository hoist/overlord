const gulp = require('gulp');
const plumber = require('gulp-plumber');
const mocha = require('gulp-mocha');
const notifierReporter = require('mocha-notifier-reporter');
const path = require('path');
const notifier = require('node-notifier');
const istanbul = require('gulp-istanbul');
const isparta = require('isparta');

function errorHandler(err) {
  notifier.notify({title: 'A Gulp error occurred', message: err.message});
  error = err;
  console.log('Error:', err.message, err.stack);
}

function runMocha(options) {
  options = options || {};
  options.require = options.require || [];
  options.require = options
    .require
    .concat([path.resolve(__dirname, '../tests/bootstrap.js')]);
  options.reporter = options.reporter || notifierReporter.decorate('spec');
  return gulp.src([
    'tests/**/*.js', '!tests/fixtures/**/*'
  ], {read: false})
    .pipe(plumber({
    errorHandler: options.errorHandler || errorHandler
  }))
    .pipe(mocha(options));
}

gulp.task('mocha', (cb) => {
  require('babel-register');
  try {
    gulp
      .src(['src/server/**/*.js'])
      .pipe(plumber({
        errorHandler: function (err) {
          cb(err);
        }
      }))
      .pipe(istanbul({instrumenter: isparta.Instrumenter}))
      .pipe(istanbul.hookRequire())
      .on('finish', function () {
        runMocha({
          errorHandler: function (err) {
            cb(err);
          }
        })
          .pipe(plumber.stop())
          .pipe(istanbul.writeReports())
          .pipe(istanbul.enforceThresholds({
            thresholds: {
              global: 50
            }
          }))
          .on('end', cb);
      });
  } catch (err) {
    cb(err);
  }
});
gulp.task('mocha-continue', (cb) => {
  require('babel-register');
  var ended = false;
  runMocha({
    errorHandler: function (err) {
      console.log(err, err.stack);
      console.log('emitting end');
      this.emit('end');
    }
  })
    .on('end', function () {
      console.log('ended');
      if (!ended) {
        ended = true;
        cb();
      }
    });
});
