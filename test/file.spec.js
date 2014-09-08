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
  , File = require(libDir + 'handlers/file')
  , GenericHandler = require(libDir + 'handlers/generichandler')
  , file
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
  , fakeDest = {}

describe('File', function () {

  beforeEach(function () {
    fakeDest.write = function () {}
    file = new File(null, fakeDest)
  })

  it('should extend GenericHandler', function () {
    file.should.be.an.instanceOf(GenericHandler)
  })

  it('should have default message format', function () {
    File.prototype.formats.should.be.an.Object
    File.prototype.formats.should.have.property('message')
  })


  describe('.log()', function () {

    it('should return this', function () {
      var retVal = file.log(entry)
      retVal.should.be.exactly(file)
    })

    it('should send the message to file', function (done) {
      fakeDest.write = function (message) {
          message.should.be.a.String
          done()
      }
      file.log(entry)
    })

    it('should log the message with a newline at the end', function (done) {
      fakeDest.write = function (message) {
          message.should.endWith('\n')
          done()
      }
      file.log(entry)
    })
  })
})
