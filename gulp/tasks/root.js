module.exports = function() {
  $.gulp.task('root:dev', function() {
    return $.gulp.src($.path.src + '/root/**/*.*')
      .pipe($.gulp.dest($.path.dist))
  })
}
