module.exports = function() {
  $.gulp.task('fonts:dev', function() {
    return $.gulp.src($.path.src + '/fonts/**/*.*')
      .pipe($.gulp.dest($.path.assets + '/fonts/'))
  })
}
