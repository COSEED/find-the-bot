var gulp = require('gulp');
var concat = require('gulp-concat');
var del = require('del');
 
var paths = {
  scripts: ['node_modules/bootstrap/dist/js/bootstrap.js'],
  stylesheets: [
      'node_modules/bootstrap/dist/css/bootstrap.css',
      'html/css/**/*.css'
  ]
};
 
// Not all tasks need to use streams 
// A gulpfile is just another node program and you can use all packages available on npm 
gulp.task('clean', function(cb) {
  // You can use multiple globbing patterns as you would with `gulp.src` 
  return del(['findthebot/static/js/*.js', 'findthebot/static/css/*.css'], cb);
});
 
gulp.task('scripts', ['clean'], function() {
  // Minify and copy all JavaScript (except vendor scripts) 
  // with sourcemaps all the way down 
  return gulp.src(paths.scripts)
    .pipe(concat('all.js'))
    .pipe(gulp.dest('findthebot/static/js/'));
});

gulp.task('stylesheets', ['clean'], function() {
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
gulp.task('default', ['watch', 'scripts', 'stylesheets']);
