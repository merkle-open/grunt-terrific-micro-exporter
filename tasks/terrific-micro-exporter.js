/*
* Export versionized Terrific Micro packages.
*
* grunt tc-micro-export
* grunt tc-micro-export:dump
* grunt tc-micro-export:release
* grunt tc-micro-export:release:minor
* grunt tc-micro-export:release:major
*
* @author Christian Stuff <christian.stuff@namics.com>
*/
'use strict';

module.exports = function(grunt) {

    var path = require('path');
    var touch = require('touch');

    require('runonymous-grunt')(grunt);

    grunt.loadNpmTasks('grunt-bump');
    grunt.loadNpmTasks('grunt-contrib-imagemin');
    grunt.loadNpmTasks('grunt-exec');
    grunt.loadNpmTasks('grunt-zip');

    var DESC = 'Export versionized Terrific Micro packages.';

    grunt.registerTask('tc-micro-exporter', DESC, function(type, incType) {

        var pkg = grunt.file.readJSON('package.json'),
            exporter = grunt.config('tc-micro-exporter'),
            tcConfig = grunt.file.readJSON('config.json'),
            tmpDirectory = exporter.tmpDirectory;

        grunt.template.addDelimiters('microDelimiters', '{%', '%}');

        if('object' === typeof exporter.bump) {
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
                }
            });
        }

        grunt.config.merge({
            exec: {
                configAssets: {
                    cmd: function(asset) {
                        var dev = grunt.option('dev'),
                        fileParts = asset.split('.'),
                        file = fixPath(tmpDirectory) + asset;

                        touch(file);

                        return 'php app/bin/micro ' + fileParts.pop()+ ':' + fileParts.join('.') + (dev ? '' : ' min') + ' > ' + file;
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
                    dest: fixPath(exporter.dumpDirectory) + grunt.template.process(exporter.dumpName, { data: pkg, delimiters: 'microDelimiters' }) + '.zip'
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
                    grunt.file.expand(path).forEach(function(file) {
                        var tmpImgFile = fixPath(tmpDirectory) + file;

                        configs.push({
                            expand: true,
                            cwd: tmpImgFile,
                            src: ['*.{png,jpg,gif,svg}', '**/*.{png,jpg,gif,svg}'],
                            dest: tmpImgFile
                        });
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

        switch(type) {
            case 'release':
                switch(incType) {
                    case 'major':
                        grunt.task.run(['bump-only:major']);
                        break;
                    case 'minor':
                        grunt.task.run(['bump-only:minor']);
                        break;
                    default:
                        grunt.task.run(['bump-only']);
                        break;
                }
                grunt.task.run(['tc-micro-exporter:dump', 'bump-commit']);
                break;
            case 'dump':
            default:
                grunt.task.run([
                    setupDirectories,
                    getMicroViews,
                    getMicroAssets,
                    copyAdditionalFiles,
                    'imagemin',
                    fetchVersion,
                    replaceInFiles,
                    mapFiles,
                    dumpFiles
                ]);
                break;
        }

        /**
        * Sets up tmpDirectory and dumpDirectory
        */
        function setupDirectories() {
            if(grunt.file.exists(tmpDirectory)) {
                grunt.file.delete(tmpDirectory, {
                    force: true
                });
            }
            grunt.file.mkdir(tmpDirectory);
            grunt.file.mkdir(exporter.dumpDirectory);
        }

        /**
        * Loads the list of views
        */
        function getMicroViews() {
            var views = [];

            if(exporter.exportViews) {
                if('object' !== typeof(tcConfig) && 'object' !== typeof(tcConfig.micro)) {
                    grunt.task.run([cleanup]);
                    grunt.fail.fatal('No correct terrific configuration found. Please check config.json to be correct.');
                }

                grunt.file.recurse(tcConfig.micro.view_directory, function(abspath, rootdir, subdir, filename) {
                    var file = filename.replace('.' + tcConfig.micro.view_file_extension, ''),
                        partialsDir = tcConfig.micro.view_partials_directory;

                    if(abspath.search(partialsDir) === 0) {
                        return;
                    }
                    if(subdir) {
                        file = subdir.replace(/\//g, '-') + '-' + file;
                    }
                    if(exporter.exportViews === true || (typeof exporter.exportViews === "object" && exporter.exportViews.length && exporter.exportViews.indexOf(file) !== -1)) {
                        grunt.task.run('exec:configViews:' + file);
                        views.push(file);
                    }
                });
            }
        }

        /**
        * Loads the Micro asset filenames from the config.json
        */
        function getMicroAssets() {
            var dev = grunt.option('dev'),
                assets = [], asset;

            if(exporter.exportAssets) {
                if('object' !== typeof(tcConfig) && 'object' !== typeof(tcConfig.assets)) {
                    grunt.task.run([cleanup]);
                    grunt.fail.fatal('No correct terrific configuration found. Please check config.json to be correct.');
                }

                for(asset in tcConfig.assets) {
                    if(tcConfig.assets.hasOwnProperty(asset)) {
                        if(exporter.exportAssets === true || (typeof exporter.exportAssets === "object" && exporter.exportAssets.length && exporter.exportAssets.indexOf(asset) !== -1)) {
                            grunt.task.run('exec:configAssets:' + asset);
                            assets.push(asset);
                        }
                    }
                }
            }
        }

        /**
        * Copies the additional files to the to-be-zipped folder
        */
        function copyAdditionalFiles() {
            var globs = exporter.additionalFiles;

            globs.forEach(function(glob) {
                var files = grunt.file.expand(glob);

                files.forEach(function(file) {
                    if(grunt.file.isDir(file)) {
                        grunt.file.mkdir(fixPath(tmpDirectory) + file);
                    }
                    if(grunt.file.isFile(file)) {
                        grunt.file.copy(file, fixPath(tmpDirectory) + file);
                    }
                });
            });
        }

        /**
        * Replace strings in configured files
        */
        function replaceInFiles() {
            var dir = tmpDirectory;

            exporter.replacements.forEach(function(entry) {
                var files = grunt.file.expand({cwd:dir},entry.files);

                files.forEach(function(file) {
                    var filePath = fixPath(dir) + file,
                    fileContent = grunt.file.read(filePath);

                    entry.replace.forEach(function(replace) {
                        fileContent = fileContent.replace(new RegExp(replace.from, "g"), replace.to);
                    });
                    grunt.file.write(filePath, fileContent);
                });
            });
        }

        /**
        * Applies the configured file mapping
        */
        function mapFiles() {
            var src, dest, files;

            for(src in exporter.mapping) {
                if(exporter.mapping.hasOwnProperty(src)) {
                    dest = fixPath(tmpDirectory) + exporter.mapping[src];
                    src = fixPath(tmpDirectory) + src;

                    grunt.file.expand(src).forEach(function(srcFile) {
                        var match = srcFile.match(src.replace(/\*/g, "(.*)")),
                            matchData = {},
                            matchDest;

                        if(match && match.length) {
                            for(var i = 1; i < match.length; i++) {
                                matchData['$'+i] = match[i];
                            }
                            matchDest = grunt.template.process(dest, { data: matchData, delimiters: 'microDelimiters' });
                        } else {
                            matchDest = dest;
                        }

                        if(grunt.file.isDir(srcFile)) {
                            files = grunt.file.expand(fixPath(srcFile) + '**');
                            files.forEach(function(file) {
                                if (grunt.file.isFile(file)) {
                                    grunt.file.copy(file, matchDest + file.replace(srcFile, ''));
                                }
                            });
                            grunt.file.delete(srcFile, {
                                force: true
                            });
                        }

                        if(grunt.file.isFile(srcFile)) {
                            grunt.file.copy(srcFile, matchDest);
                            grunt.file.delete(srcFile, {
                                force: true
                            });
                        }
                    });
                }
            }
        }

        /**
        * Handles the file dumping by configured dumpType
        */
        function dumpFiles() {
            switch(exporter.dumpType) {
                case 'folder':
                    var dest = fixPath(exporter.dumpDirectory) + grunt.template.process(exporter.dumpName, { data: pkg, delimiters: 'microDelimiters' }) + '/';

                    grunt.file.mkdir(dest);
                    grunt.file.recurse(tmpDirectory, function(abspath, rootdir, subdir, filename) {
                        if(subdir && !grunt.file.exists(fixPath(dest) + fixPath(subdir))) {
                            grunt.file.mkdir(fixPath(dest) + fixPath(subdir));
                        }
                        grunt.file.copy(abspath, fixPath(dest) + (subdir ? fixPath(subdir) : '') + filename);
                    });
                    grunt.task.run([cleanup]);
                    break;
                case 'zip':
                default:
                    grunt.task.run(['zip']);
                    grunt.task.run([cleanup]);
                    break;
            }
        }

        /**
        * Removes the tmpDirectory
        */
        function cleanup() {
            grunt.file.delete(tmpDirectory);
        }

        /**
        * Gets the current version from package.json.
        */
        function fetchVersion() {
            pkg = grunt.file.readJSON('package.json');
            grunt.config.set('pkg', pkg);
        }

        /**
        * Helper method to add trailing slash to folder names.
        */
        function fixPath(folder) {
            if(folder.substr(-1) !== '/') {
                folder += '/';
            }
            return folder;
        }
    });
};
