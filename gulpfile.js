var gulp = require('gulp');
var concat = require('gulp-concat');
var del = require('del');
 
var paths = {
  scripts: [
      'node_modules/jquery/dist/jquery.js',
      'node_modules/bootstrap/dist/js/bootstrap.js',
      'html/js/**/*.js'
  ],
  fonts: [
      'node_modules/bootstrap/dist/fonts/*',
      'html/js/**/*.js'
  ],
  stylesheets: [
      'node_modules/bootstrap/dist/css/bootstrap.css',
      'html/css/**/*.css'
  ]
};
 
gulp.task('clean-stylesheets', function(cb) {
  return del(['findthebot/static/css/*.css'], cb);
});

gulp.task('clean-scripts', function(cb) {
  return del(['findthebot/static/js/*.js'], cb);
});

gulp.task('clean-fonts', function(cb) {
  return del(['findthebot/static/fonts/*'], cb);
});

gulp.task('clean', ['clean-stylesheets', 'clean-scripts', 'clean-fonts']);

gulp.task('scripts', ['clean-scripts'], function() {
  // Minify and copy all JavaScript (except vendor scripts) 
  // with sourcemaps all the way down 
  return gulp.src(paths.scripts)
    .pipe(concat('all.js'))
    .pipe(gulp.dest('findthebot/static/js/'));
});

gulp.task('fonts', ['clean-fonts'], function() {
  // Copy all fonts
  return gulp.src(paths.fonts)
    .pipe(gulp.dest('findthebot/static/fonts/'));
});

gulp.task('stylesheets', ['clean-stylesheets'], function() {
  // Minify and copy all JavaScript (except vendor scripts) 
  // with sourcemaps all the way down 
  return gulp.src(paths.stylesheets)
    .pipe(concat('all.css'))
    .pipe(gulp.dest('findthebot/static/css/'));
});

gulp.task('watch', function() {
    gulp.watch(paths.scripts, ['scripts']);
    gulp.watch(paths.stylesheets, ['stylesheets']);
});
 
// The default task (called when you run `gulp` from cli) 
gulp.task('default', ['clean', 'watch', 'fonts', 'scripts', 'stylesheets']);
