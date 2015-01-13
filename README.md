# Grunt Terrific Micro Exporter

This tool exports your views and assets into a versioned zip file. It fetches the HTML of your views, your dynamic assets and configurable additional files. You can change the folder structure within the export. Images can be automatically optimized by imagemin. Every release will create a new version (patch, minor oder major) and commit/push it to the project repository. Versions will be bumped automatically.

## Table of contents

* [Installation](#installation)
* [Configuration](#configuration)
* [Usage](#usage)
* [Contributing](#contributing)
* [Credits & License](#credits)

## Installation

You need to have [NPM](https://www.npmjs.org) installed.
Add the files `Gruntfile.js` and `package.json` from this repository to the root of your [Terrific Micro](http://namics.github.io/terrific-micro/) project.

Run `npm install` (or `sudo npm install` if necessary) from the command line to install the dependencies.

## Configuration

Per default the `package.json` file contains the package name `terrific-micro-exporter` and the version `0.0.0`. You can change the name and version to your needs. Keep in mind that the version is bumped with every release you'll trigger.

The exporter configuration is set within `package.json` and its exporter node.

* `dumpDirectory`: the folder name, where the dumped files will be saved.
* `dumpType`: can be "zip" or "folder"
* `dumpName`: the name of the dumped zip/folder. Default: `"<%= name %>-<%= version %>"`
* `exportAssets`: can be `true` or an array containing the desired assets, e.g. `["app.css", "app.js"]`
* `exportViews`: can be `true` or an array containing the desired view names, e.g. `["index", "content"]`
* `additionalFiles`: An array containing glob patterns for additional files, that should be added to the zip files.
* `imageminPaths`: Your default paths to images, that shall be optimized by imagemin.
* `mapping`: You can define mappings for files and folders to restructure the folders inside the zip file. Mappings are processed one by another. You can access single globbed placeholders (`*`) and use them inside the destination path via grunt templates. For example: `"/path/to/*/index.html": "/dest/<%= $1 %>/index.html"` will be executed for each matched file.
* `replacements`: An array containing replace-objects (see below). You can configure different replacements for different file sets.
	* `replacements[].files`: An array containing glob patterns, where you want string replacements to get set.
	* `replacements[].replace`: An array containing objects with "from" and "to" properties. Every occurance of the string behind "from" will be replaced with the string behind "to".
* `bump`: Specific configuration keys for [grunt-bump](https://github.com/vojtajina/grunt-bump)
	* `bump.commit`: Whether the new version shall be comitted (true) or not (false)
	* `bump.files`: Array containing the version files, that shall be comitted
	* `bump.push`: Whether the new version commit shall be pushed (true) or not (false)
	* `bump.pushTo`: The remote repository ref, e.g. 'origin'
	* `bump.tag`: Whether a new version tag shall be created (true) or not (false)

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

When using `grunt micro:dump` you should change the version to prevent file overwriting (manually or by running `grunt bump-only` or `grunt-bump-only:prerelease`).

## Contributing

* For Bugs & Features please use [github](https://github.com/namics/grunt-terrific-micro-exporter/issues)
* Feel free to fork and send PRs. That's the best way to discuss your ideas.

## Credits

Terrific Micro Grunt Exporter was created by [Christian Stuff](https://github.com/Regaddi)

## License

Released under the [MIT license](LICENSE)
