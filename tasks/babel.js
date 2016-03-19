const gulp = require('gulp');
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const path = require('path');
gulp.task('babel', () => {
  return gulp
    .src('src/server/**/*.js', {base: 'src'})
    .pipe(sourcemaps.init())
    .pipe(babel({
      "presets": ["es2015", "react", "stage-0"]
    }))
    .pipe(sourcemaps.write('maps', {
      includeContent: false,
      sourceRoot: function (file) {
        return path.relative(path.resolve(process.cwd(), '../lib/maps'), path.dirname(file.path));
      }
    }))
    .pipe(gulp.dest('lib'));
});
