var gulp = require('gulp');
var gutil = require('gulp-util');
var shell = require('gulp-shell');
var Rsync = require('rsync');
var bump = require('gulp-bump');
var browserSync = require('browser-sync');
var opn = require('opn');
var runSequence = require('run-sequence');
var replace = require('replace');
var rimraf = require('rimraf');

gulp.task('release', function (done) {
    runSequence('x_clean','x_generate_release', 'x_replaceInitRoot', 'x_upload', done);
});

//destination: 'Sean@digitalsignage.com:/var/www/sites/mediasignage.com/htdocs/msgetv2',

gulp.task('x_upload', function () {
    var rsync = Rsync.build({
        source: '/cygdrive/c/msweb/msgetstarted/_dist/',
        destination: 'Sean@digitalsignage.com:/var/www/sites/mediasignage.com/htdocs/msgetstarted',
        exclude: ['*.bat', '*.iml', '.gitignore', 'gulpfile.js', '.git', '.idea', '.idea/', '_util']
    });
    rsync.set('progress');
    rsync.flags('avz');
    console.log('running the command ' + rsync.command());
    rsync.output(
        function (data) {
            console.log('sync: ' + data);
        }, function (data) {
            console.log('sync: ' + data);
        }
    );
    rsync.execute(function (error, stdout, stderr) {
        console.log('completed ' + error + ' ' + stdout + ' ' + stderr)
    });
});

gulp.task('x_replaceInitRoot', function (done) {
    replace({
        regex: 'baseUrl:"\/"',
        replacement: 'baseUrl:"\/msgetstarted"',
        paths: ['./_dist/init.js'],
        recursive: false,
        silent: false
    });
    done();
});

gulp.task('npm_publish', ['x_bump'], shell.task([
    'npm publish'
]));

gulp.task('x_generate_release', shell.task([
    'r.js.cmd -o ./_utils/app.build.js'

]));

gulp.task('local_server_dist', function () {
    process.stdout.write('Starting browserSync and superstatic...\n');
    browserSync({
        port: 8082,
        open: false,
        files: ['msgetstarted.html'],
        notify: true,
        reloadDebounce: 400,
        server: {
            baseDir: './_dist',
            directory: true
        }
    });
    opn('http://localhost:8080/_dist/msgetstarted.html')
});

gulp.task('local_server_dev', function () {
    process.stdout.write('Starting browserSync and superstatic...\n');
    browserSync({
        port: 8080,
        open: false,
        files: ['msgetstarted.html'],
        notify: true,
        reloadDebounce: 400,
        server: {
            baseDir: './',
            directory: true
        }
    });
    opn('http://localhost:8080/msgetstarted.html')
});

gulp.task('x_clean', function(done){
    rimraf('./_dist', done);
});

gulp.task('x_bump', function () {
    gulp.src('./package.json')
        .pipe(bump({type: 'PATCH', indent: 4}))
        .pipe(gulp.dest('./'));
});