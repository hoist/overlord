const gulp = require('gulp');
const gutil = require("gulp-util");
const webpack = require("webpack");
const ProgressPlugin = require('webpack/lib/ProgressPlugin');
gulp.task('webpack', (callback) => {
  var compiler = webpack(require('../config/webpack/webpack.config.js'), (err, stats) => {
    if (err)
      throw new gutil.PluginError("webpack", err);
    gutil.log("[webpack]", stats.toString({
      // output options
    }));
    callback();
  });
  compiler.apply(new ProgressPlugin(function (percentage, msg) {
    console.log((percentage * 100) + '%', msg);
  }));
});
