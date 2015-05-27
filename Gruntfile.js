'use strict';
var lrSnippet = require('grunt-contrib-livereload/lib/utils').livereloadSnippet;
var mountFolder = function (connect, dir) {
	return connect.static(require('path').resolve(dir));
};

module.exports = function (grunt) {
	// load all grunt tasks
	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

	// configurable paths
	var yeomanConfig = {
		app: 'app',
		dist: 'dist/'
	};

	try {
		yeomanConfig.app = require('./component.json').appPath || yeomanConfig.app;
	} catch (e) {}

	grunt.initConfig({
		yeoman: yeomanConfig,
		watch: {
			coffee: {
				files: ['<%= yeoman.app %>/scripts/{,*/}*.coffee'],
				tasks: ['coffee:dist']
			},
			coffeeTest: {
				files: ['test/spec/{,*/}*.coffee'],
				tasks: ['coffee:test']
			},
			compass: {
				files: ['<%= yeoman.app %>/styles/{,*/}*.{scss,sass}'],
				tasks: ['compass']
			},
			livereload: {
				files: [
					'<%= yeoman.app %>/{,*/}*.html',
					'{.tmp,<%= yeoman.app %>}/styles/{,*/}*.css',
					'{.tmp,<%= yeoman.app %>}/scripts/{,*/}*.js',
					'<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
				],
				tasks: ['livereload']
			}
		},
		connect: {
			options: {
				port: 9088,
				// Change this to '0.0.0.0' to access the server from outside.
				hostname: 'localhost'
			},
			livereload: {
				options: {
					middleware: function (connect) {
						return [
							lrSnippet,
							mountFolder(connect, '.tmp'),
							mountFolder(connect, yeomanConfig.app)
						];
					}
				}
			},
			test: {
				options: {
					middleware: function (connect) {
						return [
							mountFolder(connect, '.tmp'),
							mountFolder(connect, 'test')
						];
					}
				}
			}
		},
		open: {
			server: {
				url: 'http://localhost:<%= connect.options.port %>'
			}
		},
		clean: {
			dist: {
				files: [{
					dot: true,
					src: [
						'.tmp',
						'<%= yeoman.dist %>/*',
						'!<%= yeoman.dist %>/.git*'
					]
				}]
			},
			server: '.tmp'
		},
		jshint: {
			options: {
				jshintrc: '.jshintrc'
			},
			all: [
				'Gruntfile.js',
				'<%= yeoman.app %>/scripts/{,*/}*.js'
			]
		},
		karma: {
			unit: {
				configFile: 'karma.conf.js',
				singleRun: true
			}
		},
		coffee: {
			dist: {
				files: [{
					expand: true,
					cwd: '<%= yeoman.app %>/scripts',
					src: '{,*/}*.coffee',
					dest: '.tmp/scripts',
					ext: '.js'
				}]
			},
			test: {
				files: [{
					expand: true,
					cwd: 'test/spec',
					src: '{,*/}*.coffee',
					dest: '.tmp/spec',
					ext: '.js'
				}]
			}
		},
		compass: {
			options: {
				sassDir: '<%= yeoman.app %>/styles',
				cssDir: '.tmp/styles',
				imagesDir: '<%= yeoman.app %>/images',
				javascriptsDir: '<%= yeoman.app %>/scripts',
				fontsDir: '<%= yeoman.app %>/styles/fonts',
				importPath: '<%= yeoman.app %>/components',
				raw: 'http_images_path = "/images/"\ngenerated_images_dir = ".tmp/images"\nhttp_generated_images_path = "/images/"',
				// This doesn't work with relative paths.
				relativeAssets: false
			},
			dist: {},
			server: {
				options: {
					debugInfo: true
				}
			}
		},
		concat: {
			dist: {
				files: {
					'<%= yeoman.dist %>/scripts/scripts.js': [
						'.tmp/scripts/{,*/}*.js',
						'<%= yeoman.app %>/scripts/{,*/}*.js'
					]
				}
			}
		},
		useminPrepare: {
			html: '<%= yeoman.app %>/index.html',
			options: {
				dest: '<%= yeoman.dist %>'
			}
		},
		usemin: {
			html: ['<%= yeoman.dist %>/{,*/}*.html'],
			css: ['<%= yeoman.dist %>/styles/{,*/}*.css'],
			options: {
				dirs: ['<%= yeoman.dist %>']
			}
		},
		imagemin: {
			dist: {
				files: [{
					expand: true,
					cwd: '<%= yeoman.app %>/images',
					src: '*.{png,jpg,jpeg}',
					dest: '<%= yeoman.dist %>/images'
				}]
			}
		},
		cssmin: {
			dist: {
				files: {
					'<%= yeoman.dist %>/styles/main.css': [
						'.tmp/styles/{,*/}*.css',
						'<%= yeoman.app %>/styles/{,*/}*.css'
					]
				}
			}
		},
		htmlmin: {
			dist: {
				options: {
					/*removeCommentsFromCDATA: true,
					 // https://github.com/yeoman/grunt-usemin/issues/44
					 //collapseWhitespace: true,
					 collapseBooleanAttributes: true,
					 removeAttributeQuotes: true,
					 removeRedundantAttributes: true,
					 useShortDoctype: true,
					 removeEmptyAttributes: true,
					 removeOptionalTags: true*/
				},
				files: [{
					expand: true,
					cwd: '<%= yeoman.app %>',
					src: ['*.html', 'views/*.html'],
					dest: '<%= yeoman.dist %>'
				}]
			}
		},
		cdnify: {
			dist: {
				html: ['<%= yeoman.dist %>/*.html']
			}
		},
		ngmin: {
			dist: {
				files: [{
					expand: true,
					cwd: '<%= yeoman.dist %>/scripts',
					src: '*.js',
					dest: '<%= yeoman.dist %>/scripts'
				}]
			}
		},
		uglify: {
			dist: {
				files: {
					'<%= yeoman.dist %>/scripts/scripts.js': [
						'<%= yeoman.dist %>/scripts/scripts.js'
					]
				}
			}
		},
		rev: {
			dist: {
				files: {
					src: [
						'<%= yeoman.dist %>/scripts/{,*/}*.js',
						'<%= yeoman.dist %>/styles/{,*/}*.css',
						'<%= yeoman.dist %>/images/*.{png,jpg,jpeg,gif,webp}',
						'<%= yeoman.dist %>/styles/fonts/*'
					]
				}
			}
		},
		copy: {
			dist: {
				files: [{
					expand: true,
					dot: true,
					cwd: '<%= yeoman.app %>',
					dest: '<%= yeoman.dist %>',
					src: [
						'*.{ico,txt}',
						'.htaccess',
						'components/**/*',
						'images/{,**/}*.{gif,webp,png}',
						'resources/**/*'
					]
				}]
			}
		},
		compress: {
			main: {
				options: {
					mode: 'zip',
					archive: 'wars/tocsin.war'
				},
				files: [
					{expand: true, cwd: '<%= yeoman.dist %>', src: ['**'], dest: '/'} // includes files in path and its subdirs
				]
			}
		},
		bump: {
			options: {},
			files: [ 'package.json', 'component.json' ]
		},
		docular: {
			baseUrl: 'http://localhost:9100', //base tag used by Angular
			showAngularDocs: true, //parse and render Angular documentation
			showDocularDocs: true, //parse and render Docular documentation
			docAPIOrder : ['doc', 'angular'], //order to load ui resources
			groups: [] //groups of documentation to parse
		}
	});

	grunt.renameTask('regarde', 'watch');

	grunt.registerTask('server', [
		'clean:server',
		'coffee:dist',
		'compass:server',
		'livereload-start',
		'connect:livereload',
		'open',
		'watch'
	]);

	grunt.registerTask('test', [
		'clean:server',
		'coffee',
		'compass',
		'connect:test',
		'karma'
	]);

	grunt.registerTask('compress', [
		'compress'
	]);

	grunt.registerTask('build', [
		'clean:dist',
		'jshint',
		'test',
		'coffee',
		'compass:dist',
		'useminPrepare',
		'imagemin',
		'cssmin',
		'htmlmin',
		'concat',
		'copy',
		'cdnify',
		'ngmin',
		'uglify',
		'rev',
		'usemin',
		'compress'
	]);
	grunt.registerTask('buildDev', [
		'clean:dist',
		'jshint',
		'coffee',
		'compass:dist',
		'concat',
		'copy',
		'cdnify',
		'uglify',
		'rev'
	]);
	var myGroup = [];
	myGroup.push({
		groupTitle: 'Tocsin Docs', //Title used in the UI
		groupId: 'angular', //identifier and determines directory
		groupIcon: 'icon-book', //Icon to use for this group
		sections: [
			{
				id: 'api',
				title: 'Tocsin API',
				scripts: ['app/scripts']
			},
			{
				id: 'guide',
				title: 'Developers Guide',
				docs: ['app/scripts/directives']
			}/*,
			 {
			 id: 'tutorial',
			 title: 'Tutorial',
			 docs: ['lib/angular/ngdocs/tutorial']
			 },
			 {
			 id: 'misc',
			 title: 'Overview',
			 docs: ['lib/angular/ngdocs/misc']
			 }*/
		]
	});

	// Project configuration.

	grunt.loadNpmTasks('grunt-contrib-compass');
	grunt.loadNpmTasks('grunt-contrib-compress');
	grunt.loadNpmTasks('grunt-docular');
	grunt.registerTask('default', ['build']);
};
