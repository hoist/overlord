var gulp = require('gulp');

gulp.task('test', ['eslint', 'mocha']);
gulp.task('test-and-watch', ['eslint-continue', 'mocha-continue']);
