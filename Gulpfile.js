'use strict';
require("babel/register");
var gulp = require('gulp');
var eslint = require('gulp-eslint');
var runSequence = require('run-sequence');
var livereload = require('gulp-livereload');
var nodemon = require('gulp-nodemon');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var gulpif = require('gulp-if');
var browserify = require('browserify');
var babelify = require("babelify");
var sprity = require('sprity');
var path = require('path');
var mocha = require('gulp-spawn-mocha');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var rev = require('gulp-rev');
var globby = require('globby');
var es = require('event-stream');
var gutil = require('gulp-util');
var del = require('del');
var revReplace = require("gulp-rev-replace");
var debug = require('gulp-debug');
var gzip = require('gulp-gzip');


var globs = {
  js: {
    lib: ['lib/**/*.js', '!lib/web_app/assets/**/*.js'],
    gulpfile: ['Gulpfile.js'],
    specs: ['tests/**/*.js', '!tests/fixtures/**/*']
  },
  jsx: {
    views: ['lib/web_app/views/**/*.jsx', '!lib/web_app/views/_*/*.jsx']
  },
  web: {
    views: ['lib/web_app/views/**/*.jsx'],
    assets: {
      raw: {
        all: ['lib/web_app/assets/src'],
        scss: ['lib/web_app/assets/src/scss/**/*.scss'],
        images: ['lib/web_app/assets/src/img/**/*']
      },
      compiled: ['lib/web_app/assets/compiled/**/*']
    },
    js: {
      all: ['lib/web_app/**/*.js'],
      server: ['lib/web_app/**/*.js', '!lib/web_app/assets/**/*.js']
    }
  },
  specs: ['tests/**/*.js', '!tests/fixtures/**/*']
};

function runESLint() {
  return gulp.src(
      globs.js.lib.concat(
        globs.js.gulpfile,
        globs.specs)
    )
    .pipe(eslint())
    .pipe(eslint.formatEach());
}

function mochaServer(options) {
  options = options || {
    reporter: 'nyan',
    growl: true
  };
  options.require = options.require || [];
  options.require.push(path.resolve(__dirname, './tests/bootstrap.js'));
  return gulp.src(globs.specs, {
      read: false
    })
    .pipe(mocha(options));
}

gulp.task('eslint-build', function () {
  return runESLint().pipe(eslint.failOnError());
});
gulp.task('eslint', function () {
  return runESLint();
});



gulp.task('browserify', function () {
  var files = globby.sync(globs.jsx.views);
  var streams = files.map(function (file) {

    var b = browserify({
        debug: true,
        transform: babelify.configure({
          optional: ["es7.objectRestSpread"]
        })
      })
      .require(path.resolve(__dirname, file), {
        expose: 'view'
      })
      .require('react', {
        expose: 'react'
      })
      .require('react-transmit', {
        expose: 'react-transmit'
      })
      .add(path.resolve(__dirname, 'lib/web_app/assets/src/javascript/client.js'));
    return b.bundle()
      .pipe(source(file.replace('lib/web_app/views/', 'templates/').replace('.jsx', '.js')))
      .pipe(buffer())
      .pipe(sourcemaps.init({
        loadMaps: true
      }))
      .pipe(uglify())
      .on('error', gutil.log)
      .pipe(sourcemaps.write('./maps', {
        sourceRoot: '/js'
      }))
      .pipe(gulp.dest('lib/web_app/assets/compiled/js'));


  });
  return es.merge(streams);

});


gulp.task('mocha-server-continue', ['eslint'], function (cb) {
  var ended;
  mochaServer()
    .on('error', function () {
      this.emit('end');
    })
    .on('end', function () {
      if (ended) {
        return;
      }
      ended = true;
      cb();
    });
});
gulp.task('mocha-server', function () {
  return mochaServer({
    reporter: 'spec',
    istanbul: true
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
  }).pipe(
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
      basePath: path.resolve(__dirname, './lib/web_app/assets/compiled')
    }));
});
gulp.task('scss', ['sprite'], function () {
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

gulp.task('clean-versions', ['clean-gzipped'], function (callback) {
  var fs = require('fs');
  if (!fs.existsSync('lib/web_app/rev-manifest.json')) {
    console.log('no manifest');
    return callback();
  }
  del(['lib/web_app/assets/compiled/_layouts'], function () {
    fs.readFile('lib/web_app/rev-manifest.json', {
      encoding: 'utf8'
    }, function (err, contents) {
      if (err) {
        throw err;
      }
      var manifest = JSON.parse(contents);
      for (var propertyName in manifest) {
        var filename = 'lib/web_app/assets/compiled/' + manifest[propertyName];
        console.log('unlinking: ', filename);
        try {
          fs.unlinkSync(filename);
        } catch (deleteError) {
          console.log(deleteError.message);
        }
      }
      callback();
    });
  });
});
gulp.task('version-files', ['clean-versions'], function () {
  return gulp.src(globs.web.assets.compiled.concat(['!**/*.map']))
    .pipe(rev())
    .pipe(gulp.dest('lib/web_app/assets/compiled'))
    .pipe(rev.manifest())
    .pipe(gulp.dest('lib/web_app'));
});
gulp.task('clean-gzipped', function (callback) {
  del(['lib/web_app/assets/compiled/**/*.gz'], callback);
});
gulp.task('gzip', ['clean-gzipped'], function () {
  return gulp.src(globs.web.assets.compiled.concat(['!**/*.map']))
    .pipe(gzip())
    .pipe(gulp.dest('lib/web_app/assets/compiled'));
});
gulp.task('version-assets', ['version-files'], function () {
  var manifest = gulp.src("./lib/web_app/rev-manifest.json").pipe(debug({
    manifest: 'version:'
  }));
  return gulp.src(['lib/web_app/assets/compiled/**/*'])
    .pipe(revReplace({
      manifest: manifest
    }))
    .pipe(gulp.dest('lib/web_app/assets/compiled'));
});
gulp.task('version-layouts', ['version-files'], function () {
  var manifest = gulp.src("./lib/web_app/rev-manifest.json").pipe(debug({
    manifest: 'version:'
  }));
  return gulp.src(['lib/web_app/views/_layouts/**/*'], {
      base: 'lib/web_app/views'
    })
    .pipe(revReplace({
      manifest: manifest
    }))
    .pipe(gulp.dest('lib/web_app/assets/compiled'));
});
gulp.task('version', ['version-assets', 'version-layouts'], function () {

});
gulp.task('watch', function (callback) {
  process.env.NODE_HEAPDUMP_OPTIONS = 'nosignal';
  var spawn = require('child_process').spawn;
  var bunyan;
  var watching = false;
  runSequence(['clean', 'browserify', 'scss'], 'mocha-server-continue', function () {
    if (!watching) {
      console.log('running watch');
      livereload.listen();
      gulp.watch(globs.js.Gulpfile, ['eslint']);
      gulp.watch(globs.web.assets.raw.scss, function () {
        return runSequence('scss');
      });
      gulp.watch(globs.web.assets.raw.images, function () {
        return runSequence('sprite');
      });
      gulp.watch(globs.specs.concat(globs.js.lib), ['mocha-server-continue']);
      console.log('running nodemon');
      nodemon({
        script: 'web_server.js',
        ext: 'js jsx',
        watch: ['lib/**/*.js*', 'web_server.js'],
        ignore: ['**/assets/**/*'],
        env: {
          'NODE_HEAPDUMP_OPTIONS': 'nosignal',
          'NODE_ENV': 'development'
        },
        stdout: false
      }).on('restart', function () {
        setTimeout(livereload.reload, 1000);
      }).on('readable', function () {
        // free memory
        if (bunyan) {
          bunyan.kill();
        }
        var level = 'info';
        if (process.env.DEBUG) {
          level = 'debug';
        }
        bunyan = spawn('./node_modules/@hoist/logger/node_modules/bunyan/bin/bunyan', [
          '--output', 'short',
          '--color',
          '-l', level
        ]);
        bunyan.stdout.pipe(process.stdout).on('error', function (err) {
          console.log(4, err);
        });
        bunyan.stderr.pipe(process.stderr).on('error', function (err) {
          console.log(3, err);
        });
        this.stdout.pipe(bunyan.stdin).on('error', function (err) {
          console.log(1, err);
        });
        this.stderr.pipe(bunyan.stdin).on('error', function (err) {
          console.log(2, err);
        });
      }).on('error', function (err) {
        console.log(err);
      });
      callback();
    }
  });
});
gulp.task('seq-test', function (callback) {
  runSequence('eslint', 'mocha-server-continue', callback);
});
gulp.task('test', function (callback) {
  runSequence('build', ['eslint-build',
    'mocha-server'
  ], callback);
});
gulp.task('clean', function (callback) {
  del(globs.web.assets.compiled, callback);
});
gulp.task('build', ['clean'], function (callback) {
  runSequence(['scss', 'browserify'],
    'version', 'gzip',
    callback);
});
gulp.task('default', function () {
  return gulp.start('eslint-build',
    'mocha-server');
});
gulp.task('postdeploy', function () {
  return gulp.start(
    'scss',
    'sprite');
});
