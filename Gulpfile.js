'use strict'

const fs = require('fs')
const path = require('path')
const gulp = require('gulp')
const sass = require('gulp-sass')
const prefix = require('gulp-autoprefixer')
const webpack = require('webpack-stream')

const _appdir = path.resolve(__dirname, 'src')
const _webdir = path.resolve(__dirname, 'web')
const _builddir = path.resolve(__dirname, 'build')

const modules = {}

fs.readdirSync('node_modules')
  .filter((x) => ['.bin'].indexOf(x) === -1)
  .forEach((mod) => (modules[mod] = `commonjs ${mod}`))

gulp.task('styles', () => {
  gulp.src(_webdir + '/main.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(prefix('last 10 versions'))
    .pipe(gulp.dest(_webdir))
})

gulp.task('transpile:app', () => {
  gulp.src(_appdir + '/index.js')
    // .pipe(webpack({
    //   output: {
    //     path: _builddir,
    //     filename: 'index.js'
    //   },
    //   target: 'node',
    //   externals: modules,
    //   module: {
    //     loaders: [{
    //       test: /\.jsx?$/,
    //       include: _appdir,
    //       loader: 'babel',
    //       query: {
    //         presets: []
    //       }
    //     }]
    //   }
    // }))
    .pipe(gulp.dest(_builddir))
})

gulp.task('transpile:web', () => {
  gulp.src(_webdir + '/index.js')
    .pipe(webpack({
      output: {
        path: _webdir,
        filename: 'build.js'
      },
      module: {
        loaders: [{
          test: /\.jsx?$/,
          include: _webdir,
          loader: 'babel',
          query: {
            presets: ['es2015', 'stage-0', 'react']
          }
        }]
      }
    }))
    .pipe(gulp.dest(_webdir))
})

/* gulp.task('move', () => {
  gulp.src([_appdir + '/fonts/*']).pipe(gulp.dest(_builddir + '/fonts'))
}) */

gulp.task('transpile', ['transpile:app', 'transpile:web'])

gulp.task('build', ['transpile', 'styles', 'move'])

gulp.task('default', ['build'], () => {
  gulp.watch(_appdir + '/**/*.js', ['transpile:app'])
  gulp.watch(_webdir + '/index.js', ['transpile:web'])
  gulp.watch(_webdir + '/**/*.scss', ['styles'])
})
