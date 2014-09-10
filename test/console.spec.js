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
  , Console = require(libDir + 'handlers/console')
  , GenericHandler = require(libDir + 'handlers/generichandler')
  , handler
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
      { identity:     'Logful tester\\handlerSpec'
      , application:  'Logful tester'
      , module:       'handlerSpec'
      , pid:          4356
      }
    }
  , fakeDest = {}

describe('Console', function () {

  beforeEach(function () {
    fakeDest.write = function () {}
    handler = new Console(null, fakeDest)
  })

  it('should extend GenericHandler', function () {
    handler.should.be.an.instanceOf(GenericHandler)
  })

  it('should have default message format', function () {
    Console.prototype.formats.should.be.an.Object
    Console.prototype.formats.should.have.property('message')
  })


  describe('.log()', function () {

    it('should return this', function () {
      var retVal = handler.log(entry)

      retVal.should.be.exactly(handler)
    })

    it('should send the message to STDERR', function (done) {
      fakeDest.write = function (message) {
          message.should.be.a.String
          done()
      }
      handler.log(entry)
    })

    it('should log the message with a newline at the end', function (done) {
      fakeDest.write = function (message) {
          message.should.endWith('\n')
          done()
      }
      handler.log(entry)
    })
  })
})
