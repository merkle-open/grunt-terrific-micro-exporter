module.exports = function(grunt) {
	require('runonymous-grunt')(grunt);

	var touch = require("touch"),
		pkg = grunt.file.readJSON('package.json'),
		exporter = grunt.config.get('tc-micro-exporter').config,
		tmpDirectory = exporter.tmpDirectory;

	grunt.config.merge({
		bump: {
			options: {
				files: exporter.bump.files || [],
				updateConfigs: [],
				commit: exporter.bump.commit || false,
				commitMessage: 'Release %VERSION%',
				commitFiles: exporter.bump.files || [],
				createTag: exporter.bump.tag || false,
				tagName: 'v%VERSION%',
				tagMessage: 'Version %VERSION%',
				push: exporter.bump.push || false,
				pushTo: exporter.bump.pushTo || 'origin',
				gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d'
			}
		},
		exec: {
			configAssets: {
				cmd: function(asset) {
					var dev = grunt.option('dev'),
					fileParts = asset.split('.'),
					file = fixPath(tmpDirectory) + asset;

					touch(file);

					return 'php app/bin/micro ' + fileParts[1] + ':' + fileParts[0] + (dev ? '' : ' min') + ' > ' + file;
				}
			},
			configViews: {
				cmd: function(view) {
					var file = fixPath(tmpDirectory) + view + '.html';

					touch(file);

					return 'php app/bin/micro view:' + view + ' > ' + file;
				}
			}
		},
		zip: {
			export: {
				router: function(filepath) {
					if(filepath.search(fixPath(tmpDirectory)) >= 0) {
						filepath = filepath.replace(fixPath(tmpDirectory), '');
					}
					return filepath;
				},
				src: [fixPath(tmpDirectory) + '**'],
				dest: fixPath(exporter.dumpDirectory) + grunt.template.process(exporter.dumpName, { data: pkg }) + '.zip'
			}
		}
	});

	/** Set up imagemin paths */
	(function() {
		var imagePaths = exporter.imageminPaths,
		configs = [];

		if('string' === typeof imagePaths) {
			imagePaths = [imagePaths];
		}
		if(imagePaths && imagePaths.length) {
			imagePaths.forEach(function(path) {
				configs.push({
					expand: true,
					cwd: fixPath(path),
					src: ['*.{png,jpg,gif,svg}', '**/*.{png,jpg,gif,svg}'],
					dest: fixPath(tmpDirectory) + path
				});
			});
		}
		grunt.config.set('imagemin', {
			dynamic: {
				options: {
					optimizationLevel: 7
				},
				files: configs
			}
		});
	})();

	/**
	* Helper method to add trailing slash to folder names.
	*/
	function fixPath(folder) {
		if(folder.substr(-1) !== '/') {
			folder += '/';
		}
		return folder;
	}

	grunt.loadNpmTasks('grunt-bump');
	grunt.loadNpmTasks('grunt-contrib-imagemin');
	grunt.loadNpmTasks('grunt-exec');
	grunt.loadNpmTasks('grunt-zip');

	grunt.loadTasks('tc-micro-exporter/tasks');
};
