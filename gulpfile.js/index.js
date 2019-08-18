const gulp = require('gulp');
const gulpTs = require('gulp-typescript');
const gulpSass = require('gulp-sass');
const del = require('del');
const through2 = require('through2');
const tsProject = gulpTs.createProject('./tsconfig.json');

function cssInjection(content = '') {
  return content.replace(/\.scss/g, '.css').replace(/\.less/g, '.css');
}

function compileScss(cb) {
  gulp
    .src(['./src/**/*.scss'])
    .pipe(gulpSass().on('error', gulpSass.logError))
    .pipe(gulp.dest('./lib'));
  cb();
}

function cleanCache(cb) {
  del.sync(['./lib', './.sass-cache', './dist']);
  cb();
}

function compileTs(cb) {
  gulp
    .src(['./src/**/*.tsx', './src/**/*.ts'])
    .pipe(tsProject())
    .pipe(
      through2.obj(function(chunk, encoding, callback) {
        this.push(chunk.clone());

        if (chunk.path.match(/(\/|\\)components.*(\/|\\)index\.js/)) {
          const fileContent = chunk.contents.toString(encoding);

          chunk.contents = Buffer.from(cssInjection(fileContent));
          this.push(chunk);
          callback(null, chunk);
        } else {
          callback(null, chunk);
        }
      })
    )
    .pipe(gulp.dest('./lib'));
  cb();
}

exports.default = gulp.series(cleanCache, compileTs, compileScss);
