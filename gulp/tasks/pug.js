const pug = require('gulp-pug');

module.exports = function() {
  $.gulp.task('pug', function () {
    return $.gulp.src($.path.src + '/pages/**/*.pug')
      .pipe(pug({
        pretty: true
      }))
      .pipe($.gulp.dest($.path.dist))
      .on('end', $.browserSync.reload)
  })
}
