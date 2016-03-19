var gulp = require('gulp');
var imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');

gulp.task('static-images', () => {
  return gulp
    .src('src/assets/img/**/*')
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [
        {
          removeViewBox: false
        }
      ],
      use: [pngquant()]
    }))
    .pipe(gulp.dest('lib/assets/img'));
});
