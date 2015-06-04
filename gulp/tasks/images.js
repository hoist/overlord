'use strict';
var gulp = require('gulp');
var path = require('path');
var sprity = require('sprity');
var loadPlugins = require('gulp-load-plugins');
var globs = require('../globs');
var pngquant = require('imagemin-pngquant');
var plugins = loadPlugins();

gulp.task('sprite', ['imagemin'], function () {
  return sprity.src({
    src: './lib/web_app/assets/compiled/img/sprites/*.png',
    name: 'sprite',
    out: __dirname,
    style: '_sprite.scss',
    cssPath: '/img/',
    processor: 'sprity-sass'
  }).pipe(
    plugins.if('*.png',
      gulp.dest('./lib/web_app/assets/compiled/img'),
      gulp.dest('./lib/web_app/assets/src/scss/includes')
    )).on('error', function (error) {
    console.log(error);
  });
});
gulp.task('imagemin', function () {
  return gulp.src(globs.web.assets.raw.images)
    .pipe(plugins.imagemin({
      progressive: true,
      svgoPlugins: [{
        removeViewBox: false
      }],
      use: [pngquant()]
    }))
    .pipe(gulp.dest('lib/web_app/assets/compiled/img')).pipe(plugins.livereload({
      basePath: path.resolve(__dirname, './lib/web_app/assets/compiled')
    }));
});
