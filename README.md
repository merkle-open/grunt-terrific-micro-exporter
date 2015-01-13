# Grunt Terrific Micro Exporter

This tool exports your views and assets into a versioned zip file. It fetches the HTML of your views, your dynamic assets and configurable additional files. You can change the folder structure within the export. Images can be automatically optimized by imagemin. Every release will create a new version (patch, minor oder major) and commit/push it to the project repository. Versions will be bumped automatically.

## Table of contents

* [Installation](#installation)
* [Configuration](#configuration)
* [Usage](#usage)
* [Contributing](#contributing)
* [Credits & License](#credits)

## Installation

This plugin requires Grunt.

If you haven't used [Grunt](http://gruntjs.com) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

	npm install grunt-terrific-micro-exporter

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

	grunt.loadNpmTasks('grunt-terrific-micro-exporter');

## Configuration

In your project's Gruntfile, add a section named `'tc-micro-exporter'` to the data object passed into `grunt.initConfig()`. The options are:

	grunt.initConfig({
		'tc-micro-exporter': {
			config: {
				dumpDirectory: 'export',
				dumpType: 'zip',
				dumpName: '<%= name %>-<%= version %>',
				tmpDirectory: 'app/cache/grunt-terrific-micro-exporter-dl',
				exportAssets: true,
				exportViews: true,
				additionalFiles: [],
				imageminPaths: [],
				mapping: {},
				replacements: [],
				bump: {
					commit: true,
					files: ['package.json'],
					push: true,
					pushTo: 'origin',
					tag: true
				}
			}
		}
	});

## Options

### config.dumpDirectory

Type: `String` Default value: `'export'`
The folder name, where the dumped files will be saved.

### config.dumpType

Type: `String` Default value: `'zip'`
The type of dump. Can be `'zip'` or `'folder'`.

### config.dumpName

Type: `String` Default value: `'<%= name %>-<%= version %>'`
The name of the dumped zip/folder.

### config.tmpDirectory

Type: `String` Default value: `'app/cache/grunt-terrific-micro-export-dl'`
The path to the temporary download folder. This will be deleted after task execution.

### config.exportAssets

Type: `Boolean`|`Array` Default value: `true`
Defines if you want to export Terrific Micros assets (defined at `config.json`).
Use an array of strings, to export only selected assets.

### config.exportViews

Type: `Boolean`|`Array` Default value: `true`
Defines if you want to export Terrific Micros views.
Use an array of strings, to export only selected views.

### config.additionalFiles

Type: `Array`
An array containing glob patterns for additional files, that should be added to the dumped files.

### config.imageminPaths

Type: `Array`
Your default paths to images, that shall be optimized by imagemin.

### config.mapping

Type: `Object`
You can define mappings for files and folders to restructure the folders inside the dump. Mappings are processed one by another. You can access single globbed placeholders (`*`) and use them inside the destination path via grunt templates. For example: `"/path/to/*/index.html": "/dest/<%= $1 %>/index.html"` will be executed for each matched file.

### config.replacements

Type: `Array`
An array containing replace definition objects for Regex and String replacements inside the specified files.

For example:

	replacements: [{
		files: ["*.html", "app.css"],
		replace: [{
			from: "foo",
			to: "bar"
		}]
	}]

Will search inside every `.html` file and the `app.css` file for `"foo"` and replaces all its occurences with `"bar"`.

### config.bump

Type: `Object`
Here you can define the keys `commit`, `files`, `push`, `pushTo` and `tag` for [grunt-bump](https://github.com/vojtajina/grunt-bump).

## Usage

Here are some examples for your every day usage:

	# Create a dump based on the current version (no version change)
	# Beware: an existing dump with this version will be overwritten!
	grunt tc-micro-exporter:dump

	# Release a patch version (0.0.1 -> 0.0.2)
	grunt tc-micro-exporter:release

	# Release a minor version (0.0.2 -> 0.1.0)
	grunt tc-micro-exporter:release:minor

	# Release a major version (0.1.0 -> 1.0.0)
	grunt tc-micro-exporter:release:major

	# Release a specific version 2.0.1
	grunt tc-micro-exporter:release --setversion=2.0.1

	# Don't minify CSS and JS for patch release
	grunt tc-micro-exporter:release --dev

	# Don't minify CSS and JS for minor release
	grunt tc-micro-exporter:release:minor --dev

Use one of these and you will find a dump with the new version in your configured `dumpDirectory`. Per default a release commit and tag is pushed to your project repository (unless you're not using git). You can for sure change this behaviour by tweaking the grunt-bump configuration inside `Gruntfile.js`.

When using `grunt tc-micro-exporter:dump` you should change the version to prevent file overwriting (manually or by running `grunt bump-only` or `grunt-bump-only:prerelease`).

## Contributing

* For Bugs & Features please use [github](https://github.com/namics/grunt-terrific-micro-exporter/issues)
* Feel free to fork and send PRs. That's the best way to discuss your ideas.

## Credits

Grunt Terrific Micro Exporter was created by [Christian Stuff](https://github.com/Regaddi)

## License

Released under the [MIT license](LICENSE)
