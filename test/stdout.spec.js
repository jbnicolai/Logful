/**
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

// Make jshint play nicely with should.js
/* jshint expr: true */

'use strict';

var libDir = process.env.COV_DIR || '../lib/'
  , Stdout = require(libDir + 'handlers/stdout')
  , GenericHandler = require(libDir + 'handlers/generichandler')
  , stdout
  // Fake entry to be used for testing
  , entry =
    { level:
      { code:         6
      , name:         'info'
      , longName:     'Info'
      }
    , message:        'Hello world'
    , timestamp:      new Date()
    , origin:
      { identity:     'Logful tester\\stdoutSpec'
      , application:  'Logful tester'
      , module:       'stdoutSpec'
      , pid:          4356
      }
    }
  , fakeDest = {}

describe('Stdout', function () {

  beforeEach(function () {
    fakeDest.write = function () {}
    stdout = new Stdout(null, fakeDest)
  })

  it('should extend GenericHandler', function () {
    stdout.should.be.an.instanceOf(GenericHandler)
  })

  it('should have default message format', function () {
    Stdout.prototype.formats.should.be.an.Object
    Stdout.prototype.formats.should.have.property('message')
  })


  describe('.log()', function () {

    it('should return this', function () {
      var retVal = stdout.log(entry)

      retVal.should.be.exactly(stdout)
    })

    it('should send the message to STDOUT', function (done) {
      fakeDest.write = function (message) {
          message.should.be.a.String
          done()
      }
      stdout.log(entry)
    })

    it('should log the message with a newline at the end', function (done) {
      fakeDest.write = function (message) {
          message.should.endWith('\n')
          done()
      }
      stdout.log(entry)
    })
  })
})
