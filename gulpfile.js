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
var karma = require('gulp-karma');

var jsBuild = watchify(
    browserify(
        assign(
            {},
            watchify.args,
            {
                entries: ['./js/flashVPAID.js'],
                debug: true,
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
        .pipe(source('flashVPAID.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./demo/'))
        .pipe(reload({stream: true, once: true}));
}

gulp.task('browserify', bundle);

gulp.task('test', function () {
    return gulp.src( ['js/**/*.js', 'test/*.js'] )
        .pipe(karma({
            configFile: __dirname + '/karma.conf.js'
        }));
});

var flashFilesToMove = { files: ['VPAIDFlash.swf', 'TestAd.swf'], pathFrom: 'flash/bin-debug/', pathTo: 'demo/'};

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
gulp.task('watch', function() {
    jsBuild.on('update', bundle);
    gulp.watch(['demo/*.html', 'demo/*.css'], ['copy:static'], reload);
    gulp.watch(['demo/*.js'], ['test'], reload);
    gulp.watch(['flash/bin-debug/*.swf'], ['copy:flash'], reload);
});


//create the static server
gulp.task('serve', ['browserify', 'copy:flash', 'watch'], function () {
    browserSync({
        server: {
            baseDir: 'demo'
        }
    });
});


