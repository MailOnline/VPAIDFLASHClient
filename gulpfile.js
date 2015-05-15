'use strict';

var gulp = require('gulp');
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

gulp.task('test', function (done) {
    karma.start({
        configFile: __dirname + '/karma.conf.js'
    }, function () {
        done();
    });
});

//copy swf files and update demo
gulp.task('copy:flash', function () {
    return gulp.src(['flash/bind-debug/VPAIDFlash.swf'/*, 'flash/bind-debug/TestAd.swf'*/])
        .pipe(gulp.dest('demo/'));
});

//update html template
gulp.task('copy:static', function () {
    return gulp.src(['demo/index.html', 'demo/*.js'])
        .pipe(gulp.dest('flash/bin-debug/'));
});

//watch file changes
gulp.task('watch', function() {
    jsBuild.on('update', bundle);
    gulp.watch(['demo/*.html', 'demo/*.css', 'demo/*.js/'], ['copy:static'], reload);
    gulp.watch(['flash/bin-debug/*.swf'], ['copy:flash'], reload);
});

//create the static server
gulp.task('serve', ['browserify', 'copy:flash', 'copy:static', 'watch'], function () {
    browserSync({
        server: {
            baseDir: 'demo'
        }
    });
});


