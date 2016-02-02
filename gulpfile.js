'use strict';

var gulp = require('gulp');
var del = require('del');
var watchify = require('watchify');
var gutil = require('gulp-util');
var _ = require('lodash');
var runSequence = require('run-sequence');

//server and autoreload
var browserSync = require('browser-sync');
var reload = browserSync.reload;

//javascript bundle
var browserify = require('browserify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');
var sourcemaps = require('gulp-sourcemaps');
var buffer = require('vinyl-buffer');
var assign = _.assign;

//flash compile
var shell = require('gulp-shell');
var flashSrcPath = 'flash/src';
var flexSDK = './vendor/bin/mxmlc';
var mainFlash = 'VPAIDFlash';

//test
var KarmaServer = require('karma').Server;
var istanbul = require('browserify-istanbul');

var demoPath = './demo';
var testPath = 'test/**/**.js';
var binPath = './bin';
var mainJS = 'VPAIDFLASHClient.js';

var jsBuild = watchify(
    browserify(
        assign(
            {},
            watchify.args,
            {
                entries: ['./js/' + mainJS],
                debug: true
            }
        )
    )
);

//transform es6 to 5
jsBuild.transform(babelify);

jsBuild.on('log', gutil.log); // output build logs to terminal

function bundle() {
    return jsBuild.bundle()
        .on('error', gutil.log.bind(gutil, 'Browserify error'))
        .pipe(source(mainJS))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(binPath))
        .pipe(reload({stream: true, once: true}));
}

gulp.task('browserify', bundle);

gulp.task('test:ci', ['compile:flash'], function (done) {
    new KarmaServer({
        configFile: __dirname + '/karma.conf.js',
        reporters: ['spec', 'coverage'],
        browserify: {
            debug: true,
            transform: [
                ['babelify', {"presets": ['es2015']}],
                istanbul({instrumenterConfig: {embedSource: true}}) // temporary fix https://github.com/karma-runner/karma-coverage/issues/157#issuecomment-160555004
            ]
        },
        coverageReporter: {
            reporters: [
                {
                    type: 'text',
                    dir: 'coverage/',
                    file: 'coverage.txt'
                },
                {
                    type: 'html',
                    dir: 'coverage/'
                },
                {
                    type: 'lcovonly',
                    dir: 'coverage/',
                    subdir: '.'
                },
                {type: 'text-summary'}
            ]
        },
        browsers: ['Firefox']
    }, function (error) {
        done(error);
    }).start();
});

gulp.task('test:dev', function (done) {
    new KarmaServer({
        configFile: __dirname + '/karma.conf.js'
    }, function (error) {
        done(error);
    }).start();
});

gulp.task('compile:flash', function () {
    var files = [ {path: flashSrcPath + '/com/dailymail/vpaid/' + mainFlash + '.as', fileOutputPath: binPath + '/' + mainFlash + '.swf'}, {path: flashSrcPath + '/TestAd.as', fileOutputPath: demoPath + '/TestAd.swf'} ];

    return gulp.src(
        files.map(function (file) {
            return file.path;
        }), {read: false})
        .pipe(
            shell(
                [
                    '<%= mxmlc %> -output <%= fileOutput(file.path) %> <%= file.path %> -compiler.source-path <%= srcPath %> -target-player=<%= flashVersion %>'
                ],
                {
                    templateData: {
                        fileOutput: function (filePath) {
                            return _.find(files, function(file) {
                                return filePath.indexOf(file.path) > -1;
                            }).fileOutputPath;
                        },
                        mxmlc: flexSDK,
                        srcPath: flashSrcPath,
                        flashVersion: '10.1.0'
                    }
                }
            )
        );
});

gulp.task('compileFlashAndTest', function(done) {
  runSequence(
      'compile:flash',
      'test:dev',
      function (err) {
        done(err);
      }
  );
});

//watch file changes
gulp.task('watch:demo', function() {
    jsBuild.on('update', bundle);
    gulp.watch(['demo/*.html', 'demo/*.css'], reload);
    gulp.watch([binPath + '/*.js'], ['test:dev'], reload);
    gulp.watch([testPath], ['test:dev']);
    gulp.watch(['flash/src/**/*.as'], ['compileFlashAndTest'], reload);
});


//watch file changes
gulp.task('watch:test', function() {
    jsBuild.on('update', bundle);
    gulp.watch([binPath + '/*.js'], ['test:dev']);
    gulp.watch([testPath], ['test:dev']);
    gulp.watch(['flash/src/**/*.as'], ['compileFlashAndTest'], reload);
});


//create the static server
gulp.task('serve', ['browserify', 'compileFlashAndTest', 'watch:demo'], function () {
    browserSync({
        server: {
            baseDir: ['demo', binPath],
            routes: {
                '/swfobject.js':        'bower_components/swfobject/swfobject/src/swfobject.js'
            }
        }
    });
});

gulp.task('default', ['test:dev', 'browserify', 'watch:test']);

