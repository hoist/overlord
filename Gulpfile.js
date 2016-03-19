var gulp = require('gulp');
var runSequence = require('run-sequence');

require('require-dir')('./tasks');
gulp.task('default', ['build']);
gulp.task('build', ['clean'], (callback) => {
  runSequence([
    'static-images', 'esdoc', 'webpack', 'babel', 'views'
  ], callback);
});

gulp.task('watch', (callback) => {
  runSequence([
    'static-images', 'test-and-watch', 'esdoc'
  ], 'dev', () => {
    gulp.watch([
      'config/**/*.js', 'src/**/*.js', 'tests/**/*.js'
    ], ['test-and-watch', 'esdoc']);
    gulp.watch(['src/assets/**/*'], ['static-images']);
    callback();
  });
});

gulp.task('dev', (callback) => {
  runSequence(['build'], 'serve', callback);
})
