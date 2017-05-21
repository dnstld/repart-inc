var gulp             = require('gulp'),
	sass               = require('gulp-sass'),
	sourcemaps         = require('gulp-sourcemaps'),
	browserSync        = require('browser-sync').create(),
	watch              = require('gulp-watch'),
	minifyCSS          = require('gulp-clean-css'),
	rename             = require('gulp-rename'),
	concatJS           = require('gulp-concat'),
	minifyJS           = require('gulp-uglify'),
	deleteLines        = require('gulp-delete-lines'),
	insertLines        = require('gulp-insert-lines'),
	plumber            = require('gulp-plumber'),
	autoprefixer       = require('gulp-autoprefixer'),
	imagemin           = require('gulp-imagemin'),
	imageminPngquant   = require('imagemin-pngquant'),

	// js files
	scripts  = {
		jquery: 'vendor/jquery/dist/jquery.min.js',
		fullpage: 'vendor/fullpage.js/dist/jquery.fullpage.min.js',
		vivus: 'vendor/vivus/dist/vivus.min.js',
		main: 'dev/js/main.js'
	};

gulp.task('sass', function() {
	gulp.src('dev/scss/main.scss')
		.pipe(sourcemaps.init())
		.pipe(plumber())
		.pipe(sass())
		.pipe(autoprefixer())
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('dev/css'))
		.pipe(browserSync.reload({
			stream: true
		}));
});

gulp.task('browserSync', function() {
	browserSync.init({
		server: {
			baseDir: './'
		},
		browser: 'google-chrome',
		notify: false
	});
});

gulp.task('default', ['browserSync', 'sass'], function() {
	gulp.watch('dev/scss/**/*.+(scss|sass)', ['sass']);
	gulp.watch('*.html', browserSync.reload);
	gulp.watch('dev/js/*.js', browserSync.reload);
});

// gulp dist
gulp.task('css', function() {
	return gulp.src('dev/css/main.css')
		.pipe(minifyCSS())
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(gulp.dest('dist/css'))
});

gulp.task('js', function() {
	return gulp.src([
			scripts.jquery,
			scripts.fullpage,
			scripts.vivus,
			scripts.main
		])
		.pipe(concatJS('main.js'))
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(minifyJS().on('error', function() {
			console.log(err);
		}))
		.pipe(gulp.dest('dist/js'))
});

gulp.task('html', function() {
	return gulp.src('*.html')
		.pipe(deleteLines({
			'filters': [
				/<link\s+rel=/i
			]
		}))
		.pipe(insertLines({
			'before': /<\/head>$/,
			'lineBefore': '        <link rel="stylesheet" type="text/css" href="css/main.min.css">',
		}))
		.pipe(deleteLines({
			'filters': [
				/<script\s+src=/i
			]
		}))
		.pipe(insertLines({
			'before': /<\/body>$/,
			'lineBefore': '        <script src="js/main.min.js"></script>'
		}))
		.pipe(gulp.dest('dist'))
});

gulp.task('assets', function() {
	return gulp.src('assets/**/*')
		.pipe(gulp.dest('dist/assets'))
});

gulp.task('public', function() {
	return gulp.src('public/**/*')
		.pipe(gulp.dest('dist/'))
});

gulp.task('images', function() {
  return gulp.src('assets/images/**/*')
    .pipe(imagemin({
    	interlaced: true,
			progressive: true,
			optimizationLevel: 5,
			svgoPlugins: [{removeViewBox: true}],
			use: [imageminPngquant()]
    }))
    .pipe(plumber())
    .pipe(gulp.dest('dist/assets/images'))
});

gulp.task('dist', ['css','js', 'html', 'assets', 'public', 'images']);