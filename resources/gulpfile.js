var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var encode = require('gulp-convert-encoding');
var replace = require('gulp-replace');

gulp.task('sass', function() {
  gulp
    .src('./scss/**/*.scss')
    .pipe(
      sass({
        outputStyle: 'expanded'
      })
    )
    .pipe(
      autoprefixer({
        browsers: ['last 2 versions', 'ie >= 10', 'ChromeAndroid >= 6', 'Android >= 6', 'iOS >= 9']
      })
    )
    .pipe(gulp.dest('./../css'));
});

// watch

gulp.task('watch', function() {
  gulp.watch('./scss/**/*.scss', ['sass']);
});
