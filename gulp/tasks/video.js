module.exports = function() {
  $.gulp.task('video:dev', function() {
    return $.gulp.src($.path.src + '/video/*.{mp4,webm}')
      .pipe($.gulp.dest($.path.assets + '/video/'))
  })
}
