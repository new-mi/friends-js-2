module.exports = function() {
  $.gulp.task('server', function() {
    $.browserSync.init({
        server: $.path.dist,
        https: false,
        open: false
    });
});
}
