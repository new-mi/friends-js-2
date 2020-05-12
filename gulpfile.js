"use strict"

global.$ = {
  path: {
    task: require('./gulp/tasks.js'),
    dist: './docs',
    assets: './docs/assets',
    src: './src'
  },
  gulp: require('gulp'),
  browserSync: require('browser-sync').create(),
  plumber: require('gulp-plumber'),
  rename: require('gulp-rename'),
  concat: require('gulp-concat'),
  fs: require('fs')
}

$.path.task.forEach(taskPath => {
  require(taskPath)();
});

$.gulp.task('dev', $.gulp.series(
  'clean',
  $.gulp.parallel(
    'root:dev',
    'fonts:dev',
    'video:dev',
    'image:dev',
    'pug',
    'style:libs:dev',
    'style:dev',
    'script:libs:dev',
    'script:dev',
    'script:json:dev'
  )
));

$.gulp.task('build', $.gulp.series(
  'clean',
  // $.gulp.parallel(

  // )
));

$.gulp.task('default', $.gulp.series(
  'dev',
  $.gulp.parallel(
    'watch',
    'server'
  )
));
