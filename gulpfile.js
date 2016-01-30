var gulp        = require('gulp');
var gutil       = require('gulp-util');
var source      = require('vinyl-source-stream');
var notify      = require('gulp-notify');
var babelify    = require('babelify');
var watchify    = require('watchify');
var browserify  = require('browserify');
var browserSync = require('browser-sync').create();

function handleErrors() {
  var args = Array.prototype.slice.call(arguments);
  notify.onError({
    title: 'Compile Error',
    message: '<%= error. message %>'
  }).apply(this, args);
  this.emit('end');
}

watchify.args.debug = true;
var bundler = watchify(browserify('./src/js/App.jsx', watchify.args));

bundler.transform(babelify.configure({
  optional: ['es7.decorators']
}));

bundler.on('update', bundle);

function bundle() {
  gutil.log('Compiling App...');
  return bundler.bundle()
    .on('error', handleErrors)
    .pipe(source('./src/Entry.jsx'))
    .pipe(gulp.dest('./build/bundle.js'))
    .pipe(browserSync.stream({
      once: true
    }));
}

gulp.task('stylus', function() {
  gulp.src('./src/js/App.styl')
    .pipe(stylus())
    .pipe(gulp.dest('./lib/css'))
    .pipe(browserSync.stream({
      once: true
    }));
});

gulp.watch(['./src/js/**.styl', './src/js/**/**.styl'], ['stylus']);


gulp.task('bundle', function() {
  return bundle();
});

gulp.task('default', ['bundle', 'stylus'], function() {
  browserSync.init({
    server: './lib'
  });
});
