var grunt = require('grunt');
require('load-grunt-tasks')(grunt);

grunt.initConfig({
    'connect': {
        'demo': {
            options: {
                port: 3180,
                base: 'demo',
                livereload: 3190
            }
        }
    },
    'copy': {
        'demoFlash': {
            files: [
                { src: 'demo/swfobject.js', dest: 'bower_components/swfobject/swfobject.js' },
                { src: 'demo/VPAIDFlash.swf', dest: 'flash/bin-debug/VPAIDFlash.swf' },
                { src: 'demo/testAd.swf', dest: 'flash/bin-debug/TestAd.swf' }
            ]
        },
        'demoJS': {
            files: [
                { src: 'js/**/*.js', dest: 'demo/js/' }
            ]
        }
    },
    'browserify': {
        options: {
            transform: ['babelify', 'brfs']
        },
        'demo': {
            files: {
                'demo/flashVPAID.js': 'js/flashVPAID.js'
            }
        }
    },
    'watch': {
        options: {
            livereload: 3190
        },
        'swf': {
            files: ['flash/bin-debug/*.swf'],
            tasks: []
        },
        'js': {
            files: ['js/**/*.js'],
            tasks: ['copy:demoJS', 'babel']
        },
        'demoStatic': {
            files: ['demo/*.html', 'demo/*.css'],
            tasks: []
        }
    }
});

grunt.registerTask('default', ['copy', 'browserify', 'connect', 'watch']);

