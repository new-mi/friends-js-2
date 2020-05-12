module.exports = function() {

  $.gulp.task('script:libs:dev', function() {
    return $.gulp.src($.path.src + '/libs/**/*.js')
      .pipe($.concat('libs.min.js'))
      .pipe($.gulp.dest($.path.assets + '/js/'))
      .pipe($.browserSync.reload({
        stream: true
      }));
  })

  $.gulp.task('script:dev', function() {
    return $.gulp.src([$.path.src + '/js/main.js', $.path.src + '/components/**/*.js'])
      .pipe($.concat('main.js'))
      .pipe($.gulp.dest($.path.assets + '/js/'))
      .pipe($.browserSync.reload({
        stream: true
      }));
  })

  $.gulp.task('script:json:dev', function() {
    return $.gulp.src($.path.src + '/js/*.json')
      .pipe($.gulp.dest($.path.assets + '/js/'))
      .pipe($.browserSync.reload({
        stream: true
      }));
  })

}
