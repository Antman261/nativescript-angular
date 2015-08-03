var path = require("path");
var fs = require("fs");

module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-ts');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');

    var nsDistPath = process.env.NSDIST || '../deps/NativeScript/bin/dist';

    var modulesPath = grunt.option("modulesPath", path.join(nsDistPath, 'modules'));
    var typingsPath = grunt.option("typingsPath", path.join(nsDistPath, 'definitions'));

    var modulesDestPath = "app/tns_modules";
    var typingsDestPath = "src/typings/nativescript";
    var angularSrcPath = grunt.option("angularSrcPath") || "../src"

    grunt.initConfig({
        ts: {
            build: {
                src: [
                    'src/**/*.ts',
                    '!src/**/*ios.ts',
                    '!src/**/*ios.d.ts',
                    '!src/ios.d.ts',
                ],
                dest: 'app',
                options: {
                    fast: "never",
                    module: "commonjs",
                    target: "es5",
                    sourceMap: true,
                    removeComments: false,
                    experimentalDecorators: true,
                    emitDecoratorMetadata: true,
                    compiler: "node_modules/typescript/bin/tsc",
                    noEmitOnError: true
                },
            },
        },
        copy: {
            appFiles: {
                expand: true,
                cwd: 'src',
                src: [
                    '**/*',
                    '!**/*.ts',
                    '!typings/**/*',
                    '!**/*ios.ts',
                    '!**/*ios.d.ts',
                    '!ios.d.ts',
                ],
                dest: 'app'
            },
            modulesFiles: {
                expand: true,
                cwd: modulesPath,
                src: [
                    '**/*',
                    '!node_modules',
                    '!node_modules/**/*',
                ],
                dest: modulesDestPath
            },
            typingsFiles: {
                expand: true,
                cwd: typingsPath,
                src: [
                    '**/*',
                    '!node-tests/**/*',
                    '!es6-promise.d.ts',
                    '!es-collections.d.ts',
                ],
                dest: typingsDestPath
            },
            iosStub: {
                expand: true,
                cwd: path.join(nsDistPath, '..', '..'),
                src: [
                    'ios-stub.ts',
                ],
                dest: typingsDestPath
            },
            angularFiles: {
                expand: true,
                cwd: angularSrcPath,
                src: [
                    'angular2/**/*',
                    'nativescript-angular/**/*',
                ],
                dest: 'src/'
            },
            tnsifyAngular: {
                expand: true,
                cwd: 'app/',
                src: [
                    "angular2/**/*",
                    "nativescript-angular/**/*",
                ],
                dest: 'app/tns_modules',
            },
        },
        clean: {
            appBeforeDeploy: {
                expand: true,
                cwd: './app',
                src: [
                    'angular2',
                    'nativescript-angular',
                    'typings',
                    'tns_modules/angular2/**/*.dart',
                    '**/*.js.map',
                ]
            },
        }
    });

    grunt.registerTask("removeAppDir", function() {
        grunt.file.delete("app");
    });

    grunt.registerTask("removeNSFiles", function() {
        grunt.file.delete(typingsDestPath);
    });

    grunt.registerTask("checkModules", function() {
        if (!grunt.file.exists(modulesPath)) {
            grunt.fail.fatal("Modules path does not exist.");
        }
    });

    grunt.registerTask("checkTypings", function() {
        if (!grunt.file.exists(typingsPath)) {
            grunt.fail.fatal("Typings path does not exist.");
        }
    });

    grunt.registerTask("checkAngular", function() {
        if (!grunt.file.exists(path.join(angularSrcPath, 'angular2'))) {
            grunt.fail.fatal("angular2 path does not exist.");
        }
        if (!grunt.file.exists(path.join(angularSrcPath, 'nativescript-angular'))) {
            grunt.fail.fatal("nativescript-angular path does not exist.");
        }
    });

    grunt.registerTask("app", [
        "copy:appFiles",
        "ts:build",
        "prepareTnsModules",
    ]);

    grunt.registerTask("app-full", [
        "full-clean",
        "updateTypings",
        "updateModules",
        "updateAngular",
        "app",
    ]);

    grunt.registerTask("updateModules", [
        "checkModules",
        "copy:modulesFiles",
    ]);

    grunt.registerTask("updateTypings", [
        "checkTypings",
        "copy:typingsFiles",
        "copy:iosStub",
    ]);

    grunt.registerTask("updateAngular", [
        "checkAngular",
        "copy:angularFiles",
    ]);

    grunt.registerTask("prepareQuerystringPackage", function() {
        //The {N} require doesn't look for index.js automatically
        //so we need to declare it as main
        var packagePath = "node_modules/querystring/package.json";

        var packageData = grunt.file.readJSON(packagePath);
        packageData.main = './index.js';
        grunt.file.write(packagePath, JSON.stringify(packageData, null, 4));
    });

    grunt.registerTask("prepareTnsModules", [
        "copy:tnsifyAngular",
        "prepareQuerystringPackage",
        "clean:appBeforeDeploy",
    ]);

    grunt.registerTask("full-clean", [
        "removeAppDir",
        "removeNSFiles",
    ]);
}
