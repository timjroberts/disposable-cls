module.exports = function (grunt) {
    require("matchdep").filterDev("grunt-*")
        .forEach(function(d) { 
            var tasks = grunt.file.expand("./node_modules/" + d + "/tasks");
            
            if (tasks.length > 0) {
                tasks.forEach(grunt.loadTasks);
            }
            else {
                tasks = grunt.file.expand("../node_modules/" + d + "/tasks");
                
                if (tasks.length > 0) {
                    tasks.forEach(grunt.loadTasks);
                }
            }
        });
        
    grunt.initConfig({
        typescriptBin: grunt.file.expand("./node_modules/typescript/bin/tsc") || grunt.file.expand("../node_modules/typescript/bin/tsc"),
        tslintBin: grunt.file.expand("./node_modules/tslint/bin/tslint") || grunt.file.expand("../node_modules/tslint/bin/tslint"),
        
        typescriptFiles: grunt.file.expand([ "./*.ts", "./src/**/*.ts" ]),
        
        execute: {
            typescript: {
                src: [ "<%=typescriptBin %>" ],
                options: { cwd: ".", args: [ "--sourceMap" ] }
            },
            typescriptRelease: {
                src: [ "<%=typescriptBin %>" ],
                options: { cwd: ".", args: [ "--declaration" ] }
            },
            tslint: {
                src: [ "<%=tslintBin %>" ],
                options: { cwd: ".", args: "<%=typescriptFiles %>" }
            }
        }
    });
    
    grunt.registerTask("build",   [ "execute:typescript", "execute:tslint" ]);
    grunt.registerTask("default", [ "build" ]);
}