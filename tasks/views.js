const gulp = require('gulp');

gulp.task('views', () => {
  gulp
    .src('./src/**/*.hbs')
    .pipe(gulp.dest('./lib'));
});
