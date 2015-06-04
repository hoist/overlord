'use strict';
var gulp = require('gulp');
var del = require('del');
var fs = require('fs');
var loadPlugins = require('gulp-load-plugins');
var globs = require('../globs');

var plugins = loadPlugins();

gulp.task('clean-versions', ['clean-gzipped'], function (callback) {
  if (!fs.existsSync('lib/web_app/rev-manifest.json')) {
    console.log('no manifest');
    return callback();
  }
  del(['lib/web_app/assets/compiled/_layouts'], function () {
    fs.readFile('lib/web_app/rev-manifest.json', {
      encoding: 'utf8'
    }, function (err, contents) {
      if (err) {
        throw err;
      }
      var manifest = JSON.parse(contents);
      for (var propertyName in manifest) {
        var filename = 'lib/web_app/assets/compiled/' + manifest[propertyName];
        console.log('unlinking: ', filename);
        try {
          fs.unlinkSync(filename);
        } catch (deleteError) {
          console.log(deleteError.message);
        }
      }
      callback();
    });
  });
});
gulp.task('version-files', ['clean-versions'], function () {
  return gulp.src(globs.web.assets.compiled.concat(['!**/*.map']))
    .pipe(plugins.rev())
    .pipe(gulp.dest('lib/web_app/assets/compiled'))
    .pipe(plugins.rev.manifest())
    .pipe(gulp.dest('lib/web_app'));
});
gulp.task('version-assets', ['version-files'], function () {
  var manifest = gulp.src("./lib/web_app/rev-manifest.json").pipe(plugins.debug({
    manifest: 'version:'
  }));
  return gulp.src(['lib/web_app/assets/compiled/**/*'])
    .pipe(plugins.revReplace({
      manifest: manifest
    }))
    .pipe(gulp.dest('lib/web_app/assets/compiled'));
});
gulp.task('version-layouts', ['version-files'], function () {
  var manifest = gulp.src("./lib/web_app/rev-manifest.json").pipe(plugins.debug({
    manifest: 'version:'
  }));
  return gulp.src(['lib/web_app/views/_layouts/**/*'], {
      base: 'lib/web_app/views'
    })
    .pipe(plugins.revReplace({
      manifest: manifest
    }))
    .pipe(gulp.dest('lib/web_app/assets/compiled'));
});
gulp.task('version', ['version-assets', 'version-layouts'], function () {

});
