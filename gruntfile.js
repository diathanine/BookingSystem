/*
 * When concating ls files, we need a wrapper and we use `let` keyword to do this.
 * So, indentions of each lines are required!!
 */

/*function indentToLet (src) {
  return src.split('\n').reduce(function (array, line) {
    array.push('  ', line, '\n'); 
    return array;
  }, ['let\n']).join('');
}*/

/*global module:false*/
module.exports = function(grunt) {

  /*global require:false*/
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> [<%= pkg.author.name %>](<%= pkg.author.url %>);\n' +
      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
   
    concat: {
      livescript: {
        src: ['libs/**/*.ls', 'src/**/*.ls'],
        dest: 'tmp/.src-cache/<%= pkg.name %>.ls'
        /*options: { process: indentToLet }*/
      },
      less: {
        src: ['styles/src/**/*.less'],
        dest: 'tmp/.styles-cache/<%= pkg.name %>.less'        
      },
      css: {
        src: ['styles/src/**/*.css'],
        dest: 'tmp/.styles-cache/<%= pkg.name %>.css' 
      },
      dist: {
        src: [
          'libs/vendor/**/*.js', 
          '<%= livescript.dist.dest %>'
        ],
        dest: 'build/js/<%= pkg.name %>.js'
      }
    },
    livescript: {
      dist: {
        src: '<%= concat.livescript.dest %>',
        dest: 'tmp/.src-cache/<%= pkg.name %>.js'
      }
    },
    recess: {
      options: {
        compile: true
      },
      bootstrap: {
        src: ['styles/bootstrap/bootstrap.less'],
        dest: 'tmp/.styles-cache/bootstrap.css'
      },
      bootstrap_min: {
        options: {
          compress: true
        },
        src: ['styles/bootstrap/bootstrap.less'],
        dest: 'tmp/.styles-cache/bootstrap.min.css'
      },
      concat: {
        src: ['styles/src/**/*.less', 'styles/src/**/*.css'],
        dest: 'build/css/<%= pkg.name %>.css'
      },
      dist: {
        options: {
          compress: true
        },
        src: ['styles/src/**/*.less', 'styles/src/**/*.css'],
        dest: 'build/css/<%= pkg.name %>.min.css'
      }
    },
    dust: {
      optimizers: {
        format: function(ctx, node) { return node; }
      },
      options: {
        relative: true
      },
      index: {
        src: ['html/**/*.dust.html'],
        dest: 'build/dust/',
        ext: ".js",
        expand: true
      },
      templates: {
        src: ['templates/**/*.dust.html'],
        dest: 'build/dust/',
        ext: ".js",
        expand: true
      }
    },
    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      dist: {
        src: '<%= concat.dist.dest %>',
        dest: 'build/js/<%= pkg.name %>.min.js'
      }
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        unused: true,
        boss: true,
        eqnull: true,
        browser: true,
        globals: {
          jQuery: true
        }
      },
      gruntfile: {
        src: 'Gruntfile.js'
      }
    },
    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      styles: {
        // Which files to watch (all .less files recursively in the less directory)
        files: ['styles/src/**/*.less', 'styles/src/**/*.css'],
        tasks: ['cssminify'],
        options: {
          nospawn: true
        }
      },
      js: {
        files: ['libs/**/*.ls', 'src/**/*.ls'],
        tasks: ['jsminify']
      },
      dust: {
        src: ['html/*.html'],
        tasks: ['dustall']
      }
    }
  });
 
  grunt.registerTask('lsall', ['concat:livescript', 'livescript']);
  grunt.registerTask('jsall', ['lsall', 'concat:dist', 'jshint']);
  grunt.registerTask('jsminify', ['jsall', 'uglify']);

  grunt.registerTask('cssall', ['concat:less', 'concat:css','recess:concat']);
  grunt.registerTask('cssminify', ['cssall', 'recess:dist']);

  grunt.registerTask('dustall', ['dust:index', 'dust:templates']);

  grunt.registerTask('default', ['jsminify', 'cssminify', 'dustall']);
  grunt.registerTask('dev', ['default', 'watch']);
  grunt.registerTask('prod', ['default']);
};
