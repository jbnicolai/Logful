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

var EventEmitter = require('events').EventEmitter
  , GenericHandler = require('../lib/handlers/generichandler')
  , handler

describe('GenericHandler', function () {

  beforeEach(function () {
    // Create a new instance
    handler = new GenericHandler()
  })

  it('should merge formatting configuration with defaults for any handler', function () {
    var formats = GenericHandler.prototype.formats

    GenericHandler.prototype.formats = { message: '{test}' }
    handler = new GenericHandler({ formats: { timestamp: 'test' } })

    handler.formats.message.should.equal('{test}')
    handler.formats.timestamp.should.equal('test')

    GenericHandler.prototype.formats = formats // Restore original prototype state
  })

  it('should save the application name to the current instance', function () {
    handler = new GenericHandler({ application: 'test' })
    handler.should.have.property('application').and.equal('test')
  })


  describe('.subscribe()', function () {

    it('subscribes itself to the "entry" event of given emitter', function () {
      var emitter = new EventEmitter()

      handler.subscribe(emitter)

      emitter.listeners('entry').length.should.equal(1)
    })

    it('should hand the event data over to .log() method', function (done) {
      var emitter = new EventEmitter()

      handler.subscribe(emitter)
      handler.log = done

      emitter.emit('entry')
    })

    it('should return this', function () {
      var emitter = new EventEmitter()
        , retVal = handler.subscribe(emitter)

      retVal.should.be.an.instanceOf(GenericHandler)
    })
  })


  describe('.processItem()', function() {

    it('should return the original value if no processor is defined', function () {
      var retVal = handler.processItem('test', 'testVal', {})

      retVal.should.equal('testVal')
    })

    it('should call the processing function when present', function () {
      handler.processTest = function (value) {
        return 'processed ' + value
      }

      var retVal = handler.processItem('test', 'testVal', {})

      retVal.should.equal('processed testVal')
    })
  })
})
