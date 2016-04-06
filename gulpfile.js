'use strict';

var gulp = require('gulp');
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
var devPath = './dev';
var binPath = './bin';
var testPath = 'test/**/**.js';

function buildJs(entry) {
    var job = watchify(
        browserify(
            assign(
                {},
                watchify.args,
                {
                    entries: [entry],
                    paths: ['bower_components'],
                    debug: true
                }
            )
        )
    );

    //transform es6 to 5
    job.transform(babelify);

    job.on('log', gutil.log); // output build logs to terminal
    return job;
}

function bundle(inputFile, destinationPath, outputFile) {
    return buildJs(inputFile).bundle()
        .on('error', gutil.log.bind(gutil, 'Browserify error'))
        .pipe(source(outputFile))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(destinationPath))
        .pipe(reload({stream: true, once: true}));
}

var buildDemo =  bundle.bind(null, 'demo/demo.js', devPath, 'index.js');
var buildMain =  bundle.bind(null, 'js/VPAIDFLASHClient.js', binPath, 'VPAIDFLASHClient.js');

gulp.task('browserifyDemo', buildDemo);
gulp.task('browserify', buildMain);

gulp.task('test:ci', ['compile:flash'], function (done) {
    new KarmaServer({
        configFile: __dirname + '/karma.conf.js',
        reporters: ['spec', 'coverage'],
        browserify: {
            debug: true,
            paths: ['bower_components'],
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
    buildDemo().on('update', buildDemo);
    gulp.watch(['demo/*.html', 'demo/*.css'], reload);
    gulp.watch([binPath + '/*.js'], ['test:dev'], reload);
    gulp.watch([testPath], ['test:dev']);
    gulp.watch(['flash/src/**/*.as'], ['compileFlashAndTest'], reload);
});


//watch file changes
gulp.task('watch:test', function() {
    buildMain().on('update', buildMain);
    gulp.watch([binPath + '/*.js'], ['test:dev']);
    gulp.watch([testPath], ['test:dev']);
    gulp.watch(['flash/src/**/*.as'], ['compileFlashAndTest'], reload);
});


//create the static server
gulp.task('serve', ['browserifyDemo', 'compileFlashAndTest', 'watch:demo'], function () {
    browserSync({
        server: {
            baseDir: ['demo', binPath, 'dev']
        }
    });
});

gulp.task('default', ['test:dev', 'browserify', 'watch:test']);

