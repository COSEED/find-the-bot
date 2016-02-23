var gulp = require('gulp');
var concat = require('gulp-concat');
var del = require('del');
 
var paths = {
  spotscripts: [
      'node_modules/jquery/dist/jquery.js',
      'node_modules/jquery.scrollto/jquery.scrollTo.min.js',
      'node_modules/is-in-viewport/lib/isInViewport.min.js',
      'node_modules/bootstrap/dist/js/bootstrap.js',
      'html/js/spotter/**/*.js'
  ],
  trackerscripts: [
      'node_modules/jquery/dist/jquery.js',
      'html/js/tracker/*.js'
  ],
  react: [
      'html/js/tracker/_react/react-0.14.7.js',
      'html/js/tracker/_react/react-dom-0.14.7.js',
  ],
  fonts: [
      'node_modules/bootstrap/dist/fonts/*',
      'html/js/spotter/**/*.js'
  ],
  spotstylesheets: [
      'node_modules/bootstrap/dist/css/bootstrap.css',
      'html/css/spotter/**/*.css'
  ],
  trackerstylesheets: [
      'html/css/tracker/**/*.css'
  ]
};
 
gulp.task('clean-spotstylesheets', function(cb) {
  return del(['findthebot/static/css/all.css'], cb);
});

gulp.task('clean-trackerstylesheets', function(cb) {
  return del(['findthebot/static/css/tracker.css'], cb);
});

gulp.task('clean-spotscripts', function(cb) {
  return del(['findthebot/static/js/all.js'], cb);
});

gulp.task('clean-react', function(cb) {
  return del(['findthebot/static/js/react.js'], cb);
});

gulp.task('clean-trackerscripts', function(cb) {
  return del(['findthebot/static/js/tracker.js'], cb);
});

gulp.task('clean-fonts', function(cb) {
  return del(['findthebot/static/fonts/*'], cb);
});

gulp.task('clean', ['clean-spotstylesheets', 'clean-react', 'clean-trackerscripts', 'clean-spotscripts', 'clean-fonts']);

gulp.task('spotscripts', ['clean-spotscripts'], function() {
  // Minify and copy all JavaScript (except vendor scripts) 
  // with sourcemaps all the way down 
  return gulp.src(paths.spotscripts)
    .pipe(concat('all.js'))
    .pipe(gulp.dest('findthebot/static/js/'));
});

gulp.task('trackerscripts', ['clean-trackerscripts'], function() {
  // Minify and copy all JavaScript (except vendor scripts) 
  // with sourcemaps all the way down 
  return gulp.src(paths.trackerscripts)
    .pipe(concat('tracker.js'))
    .pipe(gulp.dest('findthebot/static/js/'));
});

gulp.task('react', ['clean-react'], function() {
  // Minify and copy all JavaScript (except vendor scripts) 
  // with sourcemaps all the way down 
  return gulp.src(paths.react)
    .pipe(concat('react.js'))
    .pipe(gulp.dest('findthebot/static/js/'));
});

gulp.task('fonts', ['clean-fonts'], function() {
  // Copy all fonts
  return gulp.src(paths.fonts)
    .pipe(gulp.dest('findthebot/static/fonts/'));
});

gulp.task('spotstylesheets', ['clean-spotstylesheets'], function() {
  // Minify and copy all JavaScript (except vendor scripts) 
  // with sourcemaps all the way down 
  return gulp.src(paths.spotstylesheets)
    .pipe(concat('all.css'))
    .pipe(gulp.dest('findthebot/static/css/'));
});

gulp.task('trackerstylesheets', ['clean-trackerstylesheets'], function() {
  // Minify and copy all JavaScript (except vendor scripts) 
  // with sourcemaps all the way down 
  return gulp.src(paths.trackerstylesheets)
    .pipe(concat('tracker.css'))
    .pipe(gulp.dest('findthebot/static/css/'));
});

gulp.task('watch', function() {
    gulp.watch(paths.spotscripts, ['spotscripts']);
    gulp.watch(paths.trackerscripts, ['trackerscripts']);
    gulp.watch(paths.spotstylesheets, ['spotstylesheets']);
    gulp.watch(paths.trackerstylesheets, ['trackerstylesheets']);
});
 
// The default task (called when you run `gulp` from cli) 
gulp.task('default', ['clean', 'watch', 'fonts', 'react', 'trackerscripts', 'spotscripts', 'trackerstylesheets', 'spotstylesheets']);
gulp.task('all', ['clean', 'fonts', 'react', 'trackerscripts', 'spotscripts', 'trackerstylesheets', 'spotstylesheets']);
