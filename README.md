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

	npm install grunt-terrific-micro-exporter --save-dev

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

	grunt.loadNpmTasks('grunt-terrific-micro-exporter');

## Configuration

In your project's Gruntfile, add a section named `'tc-micro-exporter'` to the data object passed into `grunt.initConfig()`. The options are:

	grunt.initConfig({
		'tc-micro-exporter': {
			dumpDirectory: 'export',
			dumpType: 'zip',
			dumpName: '{%= name %}-{%= version %}',
			tmpDirectory: 'app/cache/grunt-terrific-micro-exporter-dl',
			exportAssets: true,
			exportViews: true,
			additionalFiles: [],
			imageminPaths: [],
			mapping: {},
			replacements: [],
			bump: {
				commit: false,
				files: ['package.json'],
				push: false,
				pushTo: 'origin',
				tag: false
			}
		}
	});

You will also need a `package.json` file at the root of your project to hold your projects name and version.

## Options

### dumpDirectory

Type: `String` Default value: `'export'`

The folder name, where the dumped files will be saved.

### dumpType

Type: `String` Default value: `'zip'`

The type of dump. Can be `'zip'` or `'folder'`.

### dumpName

Type: `String` Default value: `'{%= name %}-{%= version %}'`

The name of the dumped zip/folder. Use the custom delimiters to make sure, that your dumps get the correct new version.

### tmpDirectory

Type: `String` Default value: `'app/cache/grunt-terrific-micro-export-dl'`

The path to the temporary download folder. This will be deleted after task execution.

### exportAssets

Type: `Boolean`|`Array` Default value: `true`

Defines if you want to export Terrific Micro assets (defined at `config.json`).
Use an array of strings, to export only selected assets.

Examples:

    [true]                   // exports all assets
    ['app.css']              // exports only `app.css`

### exportViews

Type: `Boolean`|`Array` Default value: `true`

Defines if you want to export Terrific Micro views.
Use an array of strings, to export only selected views. (without file extensions)

Examples:

    [false]                  // does not export views
    ['index','content']      // exports only `index` and `content` view

### additionalFiles

Type: `Array`

An array containing glob patterns for additional files, that should be added to the dumped files.

Example:

    ['assets/img/**','assets/fonts/**','components/modules/*/img/*']

### imageminPaths

Type: `Array`

Your default paths to images, that shall be optimized by imagemin. You can use glob patterns for wildcard directory selection.

Example:

    ['assets/img','components/modules/*/img']

### mapping

Type: `Object`

You can define mappings for files and folders to restructure the folders inside the dump. Mappings are processed one by another.
You can access single globbed placeholders (`*`) and use them inside the destination path via grunt templates.
For example: `'/path/to/*/index.html': '/dest/{%= $1 %}/index.html'` will be executed for each matched file.

Example:

    {
        'components/modules': 'components',
        'app.css': 'assets/app.min.css',
        '*.js': 'assets/{%= $1 %}.min.js'
    }

### replacements

Type: `Array`

An array containing replace definition objects for Regex and String replacements inside the specified files.

Examples:

    replacements: [{
        files: ['*.html', 'app.css'],
        replace: [{
            from: 'foo',
            to: 'bar'
        }]
    }]

Will search inside every `.html` file and the `app.css` file for `'foo'` and replaces all its occurences with `'bar'`.

    replacements: [
        {
            files: '*.html',
            replace: [
                {
                    from: '"([a-z]+)\\.(css|js)"',
                    to: '"assets/$1.min.$2"'
                }
            ]
        }
    ]

Will search inside every `.html` file for css & js file pathes and prefixes them with `assets/` and adds `.min` before the extension

### bump

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

Use one of these and you will find a dump with the new version in your configured `dumpDirectory`. Per default a release commit and tag is pushed to your project repository (unless you're not using git).

When using `grunt tc-micro-exporter:dump` you may change the version first to prevent file overwriting (manually or by running `grunt bump-only` or `grunt bump-only:prerelease`).

### Try Out

You may use this example configuration to test the export in your Terrific Micro Frontend. The Git tasks (grunt-bump) are disabled.

    'use strict';
    module.exports = function(grunt) {

        grunt.initConfig({
            'tc-micro-exporter': {
                dumpDirectory:   'export',
                dumpType:        'folder',
                dumpName:        '{%= name %}-{%= version %}',
                tmpDirectory:    'app/cache/grunt-terrific-micro-exporter-dl',
                exportAssets:    true,
                exportViews:     true,
                additionalFiles: ['assets/img/**','assets/fonts/**', 'components/modules/*/img/*'],
                imageminPaths:   ['assets/img','components/modules/*/img'],
                mapping:         {
                    'assets/img': 'assets/images',
                    'components/modules': 'components',
                    '*.css': 'assets/{%= $1 %}.min.css',
                    '*.js': 'assets/{%= $1 %}.min.js'
                },
                replacements:    [
                    {
                        files: [
                            '*.html'
                        ],
                        replace: [
                            {
                                from: 'assets/img',
                                to: 'assets/images'
                            },
                            {
                                from: 'components/modules',
                                to: 'components'
                            },
                            {
                                from: '"([a-z]+)\\.(css|js)"',
                                to: '"assets/$1.min.$2"'
                            }
                        ]
                    },
                    {
                        files: [
                            '*.css'
                        ],
                        replace: [
                            {
                                from: 'assets/img',
                                to: 'images'
                            },
                            {
                                from: 'assets/',
                                to: ''
                            },
                            {
                                from: 'components/modules',
                                to: 'components'
                            }
                        ]
                    }
                ],
                bump:            {
                    commit: false,
                    files:  ['package.json'],
                    push:   false,
                    pushTo: 'origin',
                    tag:    false
                }
            }
        });

        grunt.loadNpmTasks('grunt-terrific-micro-exporter');

    };

## Contributing

* For Bugs & Features please use [github](https://github.com/namics/grunt-terrific-micro-exporter/issues)
* Feel free to fork and send PRs. That's the best way to discuss your ideas.

## Credits

Grunt Terrific Micro Exporter was created by [Christian Stuff](https://github.com/Regaddi)

## License

Released under the [MIT license](LICENSE)
