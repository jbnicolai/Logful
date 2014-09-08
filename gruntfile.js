/*
 * Dreamscapes\logful
 *
 * Licensed under the BSD-3-Clause license
 * For full copyright and license information, please see the LICENSE file
 *
 * @author     Robert Rossmann <rr.rossmann@me.com>
 * @copyright  2014 Robert Rossmann
 * @link       https://github.com/Dreamscapes/logful
 * @license    http://choosealicense.com/licenses/BSD-3-Clause  BSD-3-Clause License
 */

'use strict';

module.exports = function (grunt) {

  // ALIASES

  var jsonFile = grunt.file.readJSON            // Read a json file
    , define = grunt.registerTask               // Register a local task
    , log = grunt.log.writeln                   // Write a single line to STDOUT


  // GRUNT CONFIGURATION

  var config =
    { srcDir:           'lib/'                  // Project's source files
    , tstDir:           'test/'                 // Project's tests
    , docDir:           'docs/'                 // Automatically generated or compiled documentation
    , covDir:           'lib-cov/'              // Files instrumented for code coverage
    , srcFiles:         ['<%= srcDir %>**/*.js', 'index.js']
    , tstFiles:         '<%= tstDir %>**/*.spec.js'
    , pkg:              jsonFile('package.json')


    // TASK DEFINITIONS

    // grunt-contrib-watch: Run tasks on filesystem changes
    , watch:
      { options:
        // Define default tasks here, then point targets' "tasks" attribute here:
        // '<%= watch.options.tasks %>'
        { tasks:        ['lint', 'test']
        , interrupt:    true
        , atBegin:      false
        , dateFormat:   function (time) { return log('Done in ' + time + 'ms') }
        }

        // Targets
      , gruntfile:      // Watch the gruntfile for changes (also auto-reloads grunt-watch config)
        { files:        'gruntfile.js'
        , tasks:        '<%= watch.options.tasks %>'
        }
      , project:        // Watch the project's source files for changes
        { files:        ['<%= srcFiles %>']
        , tasks:        '<%= watch.options.tasks %>'
        }
      , tests:          // Watch the project's test files for changes
        { files:        ['<%= tstFiles %>']
        , tasks:        '<%= watch.options.tasks %>'
        }
      }

    // grunt-contrib-jshint: Check coding style
    , jshint:
      { options:
        { jshintrc:     true
        , reporter:     require('jshint-stylish')
        }

      // Targets
      , project:        ['<%= srcFiles %>']
      , tests:          ['<%= tstFiles %>']
      , bench:          ['benchmark/**/*.js']
      , gruntfile:      ['gruntfile.js']
      }

    // grunt-contrib-clean: Clean the target files & folders, deleting anything inside
    , clean:

      // Targets
      { docs:           ['<%= docDir %>']
      , coverage:       ['<%= covDir %>', 'coverage.{html,json,lcov}']
      }

    // grunt-jscoverage: Instrument the source files for code coverage
    , jscoverage:
      { project:
        { src:          ['**/*.js']
        , cwd:          '<%= srcDir %>'
        , expand:       true
        , dest:         '<%= covDir %>'
        }
      }

    // grunt-coveralls: Publish coverage reports to coveralls.io
    , coveralls:
      { project:        'coverage.lcov'
      }

    // grunt-mocha-cli: Run the bloody tests!
    , mochacli:
      { options:
        { require:      ['should']
        , reporter:     'spec'
        }

      // Targets
      , project:        ['<%= tstDir %>']       // Normal test run
      , htmlcover:                              // Generate html coverage report
        { src:          ['<%= tstFiles %>']
        , options:
          { reporter:   'html-cov'
          , force:      true
          , env:
            { COV_DIR: '../<%= covDir %>'       // Path to instrumented libDir, relative to test dir
            }
          , save:       'coverage.html'
          }
        }
      , lcovcover:                              // Generate lcov coverage report
        { src:          ['<%= tstFiles %>']
        , options:
          { reporter:   'mocha-lcov-reporter'
          , force:      true
          , env:
            { COV_DIR: '../<%= covDir %>'       // Path to instrumented libDir, relative to test dir
            }
          , save:       'coverage.lcov'
          }
        }
      }

    // grunt-jsdoc: Generate API documentation from DocBlocks
    , jsdoc:

      // Targets
      { project:
        { options:
          { private:    false                   // Do not document private functions
          }
        , src:          ['<%= srcFiles %>', 'README.md']
        , dest:         '<%= docDir %>'
        }
      }
    }

  // Grunt modules autoloader
  require('load-grunt-tasks')(grunt);


  // GRUNT TASKS

  define('lint',              ['jshint'])
  define('test',              ['mochacli:project'])
  define('docs',              ['clean:docs', 'jsdoc'])
  define('coverage',          ['clean:coverage', 'jscoverage', 'mochacli:htmlcover'])
  define('coverage:publish',  [ 'clean:coverage'
                              , 'jscoverage'
                              , 'mochacli:lcovcover'
                              , 'coveralls:project'
                              ])
  define('build:dev',         ['lint', 'test'])
  define('build',             ['build:dev', 'docs', 'coverage'])
  define('default',           ['build'])

  //===========================================================================
  grunt.initConfig(config)
}
