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

var Syslog = require('../lib/handlers/syslog')
  , GenericHandler = require('../lib/handlers/generichandler')
  , syslog
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
      { identity:     'Logful tester\\syslogSpec'
      , application:  'Logful tester'
      , module:       'syslogSpec'
      , pid:          4356
      }
    }
  , fakeDest = {}

describe('Syslog', function () {

  beforeEach(function () {
    fakeDest.log = function () {}
    syslog = new Syslog(null, fakeDest)
  })

  it('should extend GenericHandler', function () {
    syslog.should.be.an.instanceOf(GenericHandler)
  })

  it('should have default message format', function () {
    Syslog.prototype.formats.should.be.an.Object
    Syslog.prototype.formats.should.have.property('message')
  })


  describe('.log()', function () {

    it('should return this', function () {
      var retVal = syslog.log(entry)

      retVal.should.be.exactly(syslog)
    })

    it('should send the message to Syslog', function (done) {
      fakeDest.log = function (level, message) {
        level.should.be.a.String.and.equal(entry.level.name)
        message.should.be.a.String
        done()
      }
      syslog.log(entry)
    })
  })
})
