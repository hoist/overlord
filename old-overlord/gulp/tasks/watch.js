'use strict';
var gulp = require('gulp');
var loadPlugins = require('gulp-load-plugins');
var globs = require('../globs');
var runSequence = require('run-sequence');
var plugins = loadPlugins();

gulp.task('watch', function (callback) {
  process.env.NODE_HEAPDUMP_OPTIONS = 'nosignal';
  var spawn = require('child_process').spawn;
  var bunyan;
  var watching = false;
  runSequence('clean', ['scss'], 'mocha-server-continue', function () {
    if (!watching) {
      console.log('running watch');
      plugins.livereload.listen();
      gulp.watch(globs.js.Gulpfile, ['eslint']);
      gulp.watch(globs.web.assets.raw.scss, function () {
        return runSequence('scss');
      });
      gulp.watch(globs.web.assets.raw.images, function () {
        return runSequence('sprite');
      });
      gulp.watch(globs.specs.concat(globs.js.lib), ['mocha-server-continue']);
      console.log('running nodemon');
      plugins.nodemon({
        script: 'web_server.js',
        ext: 'js jsx',
        watch: ['lib/**/*.js*', 'web_server.js'],
        ignore: ['**/assets/**/*'],
        env: {
          'NODE_HEAPDUMP_OPTIONS': 'nosignal',
          'NODE_ENV': 'development'
        },
        stdout: false
      }).on('restart', function () {
        setTimeout(plugins.livereload.reload, 1000);
      }).on('readable', function () {
        // free memory
        if (bunyan) {
          bunyan.kill();
        }
        var level = 'info';
        if (process.env.DEBUG) {
          level = 'debug';
        }
        bunyan = spawn('./node_modules/@hoist/logger/node_modules/bunyan/bin/bunyan', [
          '--output', 'short',
          '--color',
          '-l', level
        ]);
        bunyan.stdout.pipe(process.stdout).on('error', function (err) {
          console.log(4, err);
        });
        bunyan.stderr.pipe(process.stderr).on('error', function (err) {
          console.log(3, err);
        });
        this.stdout.pipe(bunyan.stdin).on('error', function (err) {
          console.log(1, err);
        });
        this.stderr.pipe(bunyan.stdin).on('error', function (err) {
          console.log(2, err);
        });
      }).on('error', function (err) {
        console.log(err);
      });
      setTimeout(function () {
        var open = require('open');
        open('http://localhost:8000');
      }, 5000);
      callback();
    }
  });
});
