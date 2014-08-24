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

var libDir = process.env.COVERAGE ? '../lib-cov/' : '../lib/'
  , Stdout = require(libDir + 'handlers/stdout')
  , GenericHandler = require(libDir + 'handlers/generichandler')
  , Logful = require(libDir + 'logful')
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
      { application:  'Logful tester'
      , module:       'stdoutSpec'
      }
    }
  , fakeOut = {}

describe('Stdout', function () {

  beforeEach(function () {
    fakeOut.write = function () {}
    stdout = new Stdout({ formats: Logful.formats }, fakeOut)
  })

  it('should extend GenericHandler', function () {
    stdout.should.be.an.instanceOf(GenericHandler)
  })


  describe('.log()', function () {

    it('should return this', function () {
      var retVal = stdout.log(entry)
      retVal.should.be.exactly(stdout)
    })

    it('should send the message to STDOUT', function (done) {
      fakeOut.write = function (message) {
          message.should.be.a.String
          done()
      }
      stdout.log(entry)
    })

    it('should log the message with a newline at the end', function (done) {
      fakeOut.write = function (message) {
          message.should.endWith('\n')
          done()
      }
      stdout.log(entry)
    })
  })
})
