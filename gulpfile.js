var gulp = require('gulp'),
    autoprefixer = require('gulp-autoprefixer'),
    less = require('gulp-less'),
    cssmin = require('gulp-minify-css'),
    jsmin = require('gulp-uglify'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    connect = require('gulp-connect'),
    clean = require('gulp-clean'),
    fileinclude = require('gulp-file-include'),
    rev = require('gulp-rev'),  // 对文件名加MD5后缀
    revCollector = require('gulp-rev-collector'),  // 路径替换
    runSequence = require('run-sequence');

gulp.task('fileInclude', function(){
  gulp.src(['./src/**/*.html', '!./src/include/*.html'])
    .pipe(fileinclude({
      prefix: '@@',  // 变量前缀
      basepath: '@file',  // 引用文件路径
      indent: true  // 保留文件的缩进
    }))
    .pipe(gulp.dest('./dist'))
    .pipe(connect.reload())
})

gulp.task('imgmin', function(){
  return gulp.src('./src/images/*')
    .pipe(gulp.dest('./dist/images'))
    .pipe(connect.reload())
})

// 开发模式的配置
gulp.task('css', function () {
  return gulp.src('./src/css/*.less')
      .pipe(less())
      .pipe(autoprefixer())
      .pipe(cssmin())
      .pipe(concat('index.css'))
      .pipe(rename({suffix: '.min'}))
      .pipe(gulp.dest('./dist/css'))
      .pipe(connect.reload())
})
gulp.task('js', function () {
  return gulp.src('./src/js/*.js')
      .pipe(gulp.dest('./dist/js'))
      .pipe(connect.reload())
})
gulp.task('html', function () {
  return gulp.src('./src/*.html')
      .pipe(gulp.dest('./dist'))
      .pipe(connect.reload())
})

// 打包添加md5后缀
gulp.task('revCss', function () {
  return gulp.src('./src/css/*.less')
      .pipe(less())
      .pipe(autoprefixer())
      .pipe(cssmin())
      .pipe(concat('index.css'))
      .pipe(rename({suffix: '.min'}))
      .pipe(rev())
      .pipe(gulp.dest('./dist/css'))
      .pipe(rev.manifest())
      .pipe(gulp.dest('./rev/css'))
})
gulp.task('revJs', function () {
  return gulp.src('./src/js/*.js')
      .pipe(rev())
      .pipe(gulp.dest('./dist/js'))
      .pipe(rev.manifest())
      .pipe(gulp.dest('./rev/js'))
})
gulp.task('revHtml', function () {
  return gulp.src(['./rev/**/*.json', './dist/*.html'])
      .pipe(revCollector())
      .pipe(gulp.dest('./dist'))
})

gulp.task('clean', function () {
  return gulp.src(['./rev/css', './rev/js', './dist/css', './dist/js'], {read: false})
      .pipe(clean())
})
gulp.task('dev', function (done) {
  return condition = false;
  runSequence(['revCss'], ['revJs'], ['revHtml'], done)
})
gulp.task('watch', function () {
  gulp.watch('./src/css/*.less', ['css']);
  gulp.watch('./src/js/*.js', ['js']);
  gulp.watch('./src/images/*', ['imgmin']);
  gulp.watch('./src/*.html', ['html']);
  gulp.watch(['./src/**/*.html', '!./src/include/*.html'], ['fileInclude'])
})
gulp.task('server', function(){
  connect.server({
    root: './dist',
    livereload: true,
    port: 8100
    /*
    middleware: function (connect, opt) {
      return [
      proxy('/api', {
        target: 'http://yx.hsdatawing.com',
        changeOrigin:true,
        pathRewrite: {
          '^/api': ''
        }
      })]
    }
    */
  })
})

// 切换 上：开发  下：打包，执行 'gulp clean' 可删除已生产的css、js文件
gulp.task('default', ['server', 'css', 'js', 'imgmin', 'html', 'fileInclude', 'watch']);
// gulp.task('default', ['server', 'revCss', 'revJs', 'imgmin', 'revHtml', 'watch', 'dev']);
