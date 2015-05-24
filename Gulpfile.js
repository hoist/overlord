'use strict';
var gulp = require('gulp');
var jshint = require('gulp-jshint');
var mocha = require('gulp-mocha');
var runSequence = require('run-sequence');
var livereload = require('gulp-livereload');
var nodemon = require('gulp-nodemon');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var gulpif = require('gulp-if');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var gutil = require('gulp-util');
var babelify = require("babelify");
var sprity = require('sprity');
var path = require('path');

require("babel/register");

var globs = {
  js: {
    lib: ['lib/**/*.js', '!lib/web_app/assets/**/*.js'],
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

gulp.task('jshint-build', function () {
  return runJshint().pipe(jshint.reporter('fail'));
});
gulp.task('jshint', function () {
  return runJshint();
});

gulp.task('browserify', function () {
  var b = browserify({
    entries: './lib/web_app/assets/src/javascript/client.js',
    debug: true,
    extensions: ['jsx'],
    // defining transforms here will avoid crashing your stream
    transform: [babelify]
  });
  return b.bundle()
    //create a fake source file
    .pipe(source('client.js'))
    //buffer all the output so it looks like a single file to the next step
    .pipe(buffer())
    //create source maps
    .pipe(sourcemaps.init({
      loadMaps: true
    }))
    //uglify
    //.pipe(uglify())
    .on('error', gutil.log)
    //write maps to maps sub directory
    .pipe(sourcemaps.write('./maps'))
    //write the bundled uglified files
    .pipe(gulp.dest('lib/web_app/assets/compiled/js'));
});


gulp.task('mocha-server-continue', function (cb) {

  mochaServer()
    .on('error', function (err) {
      console.trace(err);
      this.emit('end');
    })
    .on('end', cb);
});
gulp.task('mocha-server', function () {
  mochaServer({
    reporter: 'spec'
  });
});
gulp.task('sprite', ['imagemin'], function () {
  return sprity.src({
      src: './lib/web_app/assets/compiled/img/sprites/*.png',
      name: 'sprite',
      out: __dirname,
      style: '_sprite.scss',
      cssPath: '/img/',
      processor: 'sprity-sass'
    })
    .pipe(
      gulpif('*.png',
        gulp.dest('./lib/web_app/assets/compiled/img'),
        gulp.dest('./lib/web_app/assets/src/scss/includes')
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
      basePath: path.resolve(__dirname,'./lib/web_app/assets/compiled')
    }));
});
gulp.task('scss',['sprite'], function () {
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
          ignore: '**/assets/**/*.*',
          env: {
            'NODE_HEAPDUMP_OPTIONS': 'nosignal',
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
    'mocha-server');
});
gulp.task('build', function () {
  return gulp.start('scss');
});
gulp.task('default', function () {
  return gulp.start('jshint-build',
    'mocha-server');
});
gulp.task('postdeploy', function () {
  return gulp.start(
    'scss',
    'sprite');
});
