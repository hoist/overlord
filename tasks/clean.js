const gulp = require('gulp');
const del = require('del');

gulp.task('clean-lib', () => {
  return del('lib');
});

gulp.task('clean-docs', () => {
  return del('code-docs');
});
gulp.task('clean-coverage', () => {
  return del('coverage');
});
gulp.task('clean', ['clean-lib', 'clean-coverage', 'clean-docs']);
