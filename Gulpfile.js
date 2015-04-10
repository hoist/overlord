'use strict';
var gulp = require('gulp');
var jshint = require('gulp-jshint');
var istanbul = require('gulp-istanbul');
var mocha = require('gulp-mocha');
var coverageEnforcer = require('gulp-istanbul-enforcer');
var runSequence = require('run-sequence');
var livereload = require('gulp-livereload');
var nodemon = require('gulp-nodemon');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var sprite = require('css-sprite').stream;
var gulpif = require('gulp-if');
var browserify = require('browserify');
var reactify = require('reactify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var gutil = require('gulp-util');
var uglify = require('gulp-uglify');

var globs = {
  js: {
    lib: ['lib/**/*.js', '!lib/assets/**/*.js'],
    gulpfile: ['Gulpfile.js'],
    specs: ['tests/**/*.js', '!tests/fixtures/**/*']
  },
  web: {
    views: ['lib/web_app/views/**/*.jsx'],
    assets: {
      raw: {
        all: ['lib/web_app/assets/src'],
        scss: ['lib/web_app/assets/src/scss/**/*.scss'],
        images: ['lib/web_app/assets/src/img/**/*']
      },
      compiled: ['lib/web_app/assets/compiled']
    },
    js: {
      all: ['lib/web_app/**/*.js'],
      server: ['lib/web_app/**/*.js', '!lib/web_app/assets/**/*.js']
    }
  },
  specs: ['tests/**/*.js', '!tests/fixtures/**/*']
};

function runJshint() {
  return gulp.src(
      globs.js.lib.concat(
        globs.js.gulpfile)
    )
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('jshint-growl-reporter'));
}

function mochaServer(options) {

    return gulp.src(globs.specs, {
        read: false
      })
      .pipe(mocha(options || {
        reporter: 'nyan',
        growl: true
      }));
  }
  // Testing
var coverageOptions = {
  dir: './coverage',
  reporters: ['html', 'lcov', 'text-summary', 'html', 'json'],
  reportOpts: {
    dir: './coverage'
  }
};

gulp.task('jshint-build', function () {
  return runJshint().pipe(jshint.reporter('fail'));
});
gulp.task('jshint', function () {
  return runJshint();
});

gulp.task('browserify-react', function () {
  var b = browserify({
    entries: './lib/web_app/assets/src/javascript/react_components.js',
    debug: true,
    extensions: ['jsx'],
    // defining transforms here will avoid crashing your stream
    transform: [reactify]
  });
  return b.bundle()
    //create a fake source file
    .pipe(source('react_components.js'))
    //buffer all the output so it looks like a single file to the next step
    .pipe(buffer())
    //create source maps
    .pipe(sourcemaps.init({
      loadMaps: true
    }))
    //uglify
    .pipe(uglify())
    .on('error', gutil.log)
    //write maps to maps sub directory
    .pipe(sourcemaps.write('./maps'))
    //write the bundled uglified files
    .pipe(gulp.dest('lib/web_app/assets/compiled/js'));
});


gulp.task('mocha-server-continue', function (cb) {
  gulp.src(globs.js.lib)
    .pipe(istanbul())
    .on('error', function (err) {
      console.log('istanbul error', err);
    })
    .on('finish', function () {
      mochaServer().on('error', function (err) {
          console.trace(err);
          this.emit('end');
          cb();
        }).pipe(istanbul.writeReports(coverageOptions))
        .on('end', cb);
    });
});
gulp.task('enforce-coverage', ['mocha-server'], function () {
  var options = {
    thresholds: {
      statements: 80,
      branches: 80,
      lines: 80,
      functions: 80
    },
    coverageDirectory: 'coverage',
    rootDirectory: process.cwd()
  };
  return gulp.src(globs.js.lib)
    .pipe(coverageEnforcer(options));
});
gulp.task('mocha-server', function (cb) {
  gulp.src(globs.js.lib)
    .pipe(istanbul())
    .on('finish', function () {
      mochaServer({
          reporter: 'spec'
        })
        .pipe(istanbul.writeReports(coverageOptions))
        .on('end', cb);
    });
});
gulp.task('sprite', ['imagemin'], function () {
  return gulp.src('lib/web_app/assets/compiled/img/sprites/*.png')
    .pipe(sprite({
      name: 'sprite',
      style: '_sprite.scss',
      cssPath: '/img/',
      processor: 'scss'
    }))
    .pipe(
      gulpif('*.png',
        gulp.dest('lib/web_app/assets/compiled/img'),
        gulp.dest('lib/web_app/assets/src/scss/includes')
      )).on('error', function (error) {
      console.log(error);
    });
});
gulp.task('imagemin', function () {
  return gulp.src(globs.web.assets.raw.images)
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{
        removeViewBox: false
      }],
      use: [pngquant()]
    }))
    .pipe(gulp.dest('lib/web_app/assets/compiled/img')).pipe(livereload({
      basePath: '/Volumes/Store/Projects/hoist/overlord/lib/web_app/assets/compiled'
    }));
});
gulp.task('scss', function () {
  gulp.src(globs.web.assets.raw.scss)
    .pipe(sourcemaps.init())
    .pipe(sass({
      includePaths: require('node-reset-scss').includePath
    }))
    .pipe(sourcemaps.write('./maps'))
    .pipe(gulp.dest('lib/web_app/assets/compiled/css')).pipe(livereload({
      basePath: '/Volumes/Store/Projects/hoist/overlord/lib/web_app/assets/compiled'
    }));
});
gulp.task('watch', function () {

  var watching = false;
  gulp.start(
    'scss',
    'imagemin',
    'sprite',
    'jshint',
    'mocha-server-continue',
    function () {
      // Protect against this function being called twice
      if (!watching) {
        watching = true;
        livereload.listen();
        gulp.watch('lib/web_app/assets/compiled/img/sprites/*.png', ['sprite']);
        gulp.watch(globs.js.Gulpfile, ['jshint']);
        gulp.watch(globs.web.assets.raw.scss, ['scss']);
        gulp.watch(globs.web.assets.raw.images, ['imagemin']);
        nodemon({
          script: 'web_server.js',
          ext: 'js jsx',
          watch: 'lib/web_app/**/*.js*',
          ignore: '**/assets/*.*',
          env: {
            'NODE_ENV': 'development'
          }
        }).on('restart', function () {
          setTimeout(livereload.reload, 1000);
        });
      }
    });
});
gulp.task('seq-test', function () {
  return runSequence('jshint', 'mocha-server-continue');
});
gulp.task('test', function () {
  return gulp.start('jshint-build',
    'mocha-server',
    'enforce-coverage');
});
gulp.task('build', function () {
  return gulp.start('jshint-build',
    'mocha-server',
    'enforce-coverage');
});
gulp.task('default', function () {
  return gulp.start('jshint-build',
    'mocha-server',
    'enforce-coverage');
});
gulp.task('postdeploy', function () {
  return gulp.start(
    'scss',
    'sprite');
});
