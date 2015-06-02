'use strict';

var gulp = require('gulp');
var del = require('del');
var watchify = require('watchify');
var gutil = require('gulp-util');

//server and autoreload
var browserSync = require('browser-sync');
var reload = browserSync.reload;

//javascript bundle
var browserify = require('browserify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');
var sourcemaps = require('gulp-sourcemaps');
var buffer = require('vinyl-buffer');
var assign = require('lodash').assign;

//test
var karma = require('karma').server;

var testPath = 'test/**/**.js';
var binPath = './bin';
var mainJS = 'VPAIDFlashToJS.js';

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

gulp.task('test', function (done) {
    karma.start({
        configFile: __dirname + '/karma.conf.js'
    }, function () {
        done();
    });
});

var flashFilesToMove = { files: ['VPAIDFlash.swf'], pathFrom: 'flash/bin-debug/', pathTo: binPath };

//copy swf files and update demo
gulp.task('copy:flash', mvFiles.bind(null, flashFilesToMove));

function mvFiles(cfg, done) {
    var filesToMv = cfg.files.map(function (file) {
        return cfg.pathFrom + file;
    });
    var filesToDel = cfg.files.map(function (file) {
        return cfg.pathTo + file;
    });
    del(filesToDel, function () {
        gulp.src(filesToMv)
            .pipe(gulp.dest(cfg.pathTo))
            .on('end', done);
    });
}


//watch file changes
gulp.task('watch:demo', function() {
    jsBuild.on('update', bundle);
    gulp.watch(['demo/*.html', 'demo/*.css'], reload);
    gulp.watch([binPath + '/*.js'], ['test'], reload);
    gulp.watch([testPath], ['test']);
    gulp.watch(['flash/bin-debug/*.swf'], ['copy:flash'], reload);
});


//watch file changes
gulp.task('watch:test', function() {
    jsBuild.on('update', bundle);
    gulp.watch([binPath + '/*.js'], ['test']);
    gulp.watch([testPath], ['test']);
    gulp.watch(['flash/bin-debug/*.swf'], ['copy:flash', 'test']);
});


//create the static server
gulp.task('serve', ['browserify', 'copy:flash', 'watch:demo'], function () {
    browserSync({
        server: {
            baseDir: ['demo', binPath],
            routes: {
                '/swfobject.js':        'bower_components/swfobject/swfobject/src/swfobject.js',
                '/TestAd.swf':          'flash/bin-debug/TestAd.swf'
            }
        }
    });
});

gulp.task('default', ['test', 'browserify', 'watch:test']);

