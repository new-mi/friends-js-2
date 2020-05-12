const
  sass = require('gulp-sass'),
  autoprefixer = require('gulp-autoprefixer'),
  sourcemaps = require('gulp-sourcemaps'),
  concatCss = require('gulp-concat-css'),
  csso = require('gulp-csso');

  module.exports = function() {

    $.gulp.task('style:libs:dev', function() {
      return $.gulp.src($.path.src + '/libs/**/*.css')
        .pipe(concatCss('libs.min.css'))
        .pipe(csso())
        .pipe($.gulp.dest($.path.assets + '/css/'))
        .pipe($.browserSync.reload({
          stream: true
        }));
    })

    $.gulp.task('style:dev', function() {
      return $.gulp.src($.path.src + '/styles/main.sass')
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(autoprefixer({
              overrideBrowserslist:  ['last 10 versions']
        }))
        .pipe(sourcemaps.write())
        .pipe($.gulp.dest($.path.assets + '/css/'))
        .pipe($.browserSync.reload({
          stream: true
        }));
    })

  }
