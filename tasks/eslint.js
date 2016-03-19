var gulp = require('gulp');
var eslint = require('gulp-eslint');

function runEslint() {
  return gulp
    .src(['Gulpfile.js', 'src/**/*.js', 'config/**/*.js(on)?', 'tests/**/*.js'])
    .pipe(eslint())
    .pipe(eslint.formatEach());
}
gulp.task('eslint', () => {
  return runEslint().pipe(eslint.failOnError());
});
gulp.task('eslint-continue', () => {
  return runEslint();
});
