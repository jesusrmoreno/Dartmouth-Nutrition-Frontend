var gulp        = require('gulp');
var gutil       = require('gulp-util');
var stylus      = require('gulp-stylus');
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
var bundler = watchify(browserify('./src/components/App.jsx', watchify.args));

bundler.transform(babelify.configure({
  optional: ['es7.decorators']
}));

bundler.on('update', bundle);
function bundle() {
  gutil.log('Compiling App...');
  return bundler.bundle()
    .on('error', handleErrors)
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('./lib/js/'))
    .pipe(browserSync.stream({
      once: true
    }));
}

gulp.task('bundle', function() {
  return bundle();
});

gulp.task('default', ['bundle'], function() {
  browserSync.init({
    server: './'
  });
});
