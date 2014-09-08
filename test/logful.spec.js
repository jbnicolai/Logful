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
  , EventEmitter = require('events').EventEmitter
  , Logful = require(libDir + 'logful')
  , Stdout = require(libDir + 'handlers/stdout')
  , logger


describe('Logful', function () {

  beforeEach(function () {
    Logful.handlers = []    // Reset the loaded handlers so we can provide configuration per test
    Logful.application('node')
    Logful.level('info')
    logger = new Logful()   // Create a new instance
  })


  it('should extend EventEmitter', function () {
    logger.should.be.an.instanceOf(EventEmitter)
  })

  it('should have alias functions for all log levels', function () {
    var calls = []
      , severities = Object.keys(Logful.severities)

    logger.log = function (level) {
      calls.push(level)
    }

    severities.forEach(function (key) {
      logger[key].should.be.a.Function
      logger[key](key, '')
    })

    calls.should.containDeep(severities)
  })

  it('should support printf-like message input', function (done) {
    logger.on('entry', function (entry) {
      entry.message.should.equal('Hello world')
      done()
    })

    logger.info('Hello %s', 'world')
  })


  describe('property:identity', function () {

    it('should be a combination of application and module names', function () {
      // When module name is present
      Logful.application('test')
      logger = new Logful('myApp')
      logger.identity.should.equal('test\\myApp')
    })
  })


  describe('property:severities', function () {

    it('should be frozen', function () {
      Object.isFrozen(Logful.severities).should.be.true
    })
  })


  describe('.log()', function () {

    it('should emit "entry" event when called', function (done) {
      logger.on('entry', function () {
        done()
      })

      logger.log('info', 'Hello world')
    })

    it('should trigger warning when the level is not recognised', function (done) {
      logger.on('entry', function (entry) {
        entry.level.name.should.equal('warn')
        done()
      })

      logger.log('undef', 'Hello world')
    })

    it('should emit "log" event in the next tick', function (done) {
      // If this triggers the event in the current tick, the event
      // listener below will not be triggered
      logger.log('info', 'Hello world')

      logger.on('entry', function (entry) {
        entry.level.name.should.equal('info')
        done()
      })
    })

    it('should return itself', function () {
      var retVal = logger.log('info', 'Hello world')

      retVal.should.be.exactly(logger)
    })

    it('should accept Error object as message', function (done) {
      logger.on('entry', function (entry) {
        entry.message.should.equal('Hello world')
        done()
      })

      logger.log('info', new Error('Hello world'))
    })
  })


  describe('event:entry', function () {

    beforeEach(function () {
      logger.log('info', 'Hello world')
    })

    it('should contain property - level (object)', function (done) {
      logger.on('entry', function (entry) {
        entry.should.have.property('level')
        entry.level.should.have.property('code')
        entry.level.should.have.property('name')
        entry.level.should.have.property('longName')
        done()
      })
    })

    it('should contain property - message', function (done) {
      logger.on('entry', function (entry) {
        entry.should.have.property('message')
        done()
      })
    })

    it('should contain property - timestamp (Date)', function (done) {
      logger.on('entry', function (entry) {
        entry.should.have.property('timestamp')
        entry.timestamp.should.be.an.instanceOf(Date)
        done()
      })
    })

    it('should contain property - origin (object)', function (done) {
      logger.on('entry', function (entry) {
        entry.should.have.property('origin')
        entry.origin.should.have.property('identity')
        entry.origin.should.have.property('application')
        entry.origin.should.have.property('module')
        entry.origin.should.have.property('pid')
        done()
      })
    })
  })


  describe(':level()', function () {

    it('should block entries below this level', function (done) {
      logger.on('entry', function() {
        throw new Error('debug entry logged when threshold is set higher')
      })
      logger.log('debug', 'Hello world')
      process.nextTick(done)
    })

    it('should accept entries of the same level', function (done) {
      logger.on('entry', function() {
        done()
      })
      // Log an entry of the same level as currently set as minimum
      logger.log('info', 'Hello world')
    })

    it('should throw when attempting to set to invalid level', function () {
      (function () {
        Logful.level('undef')
      }).should.throw()
    })

    it('should allow valid levels', function () {
      (function () {
        Logful.level('warn')
      }).should.not.throw()
    })
  })


  describe(':use()', function () {

    it('should load module from lib/handlers if given a string', function () {
      Logful.use('stdout')
      Logful.handlers.stdout.should.be.an.instanceOf(Stdout)
    })

    it('should make all loaded handlers a subscriber of the "entry" event', function (done) {
      Logful.use('stdout')
      var originalFn = Logful.handlers.stdout.subscribe
      Logful.handlers.stdout.subscribe = function () {
        Logful.handlers.stdout.subscribe = originalFn
        done()
      }
      logger = new Logful()
    })

    it('should accept custom handlers as functions', function (done) {
      var CustomHandler = function () {} // empty constructor
      CustomHandler.prototype.subscribe = function (emitter) {
        emitter.should.be.an.instanceOf(Logful)
        done()
      }

      Logful.use(CustomHandler)
      logger = new Logful()
    })

    it('should do nothing if this handler is already loaded', function () {
      var calls = 0
        , CustomHandler = function () {
            calls++
          }

      Logful
        .use(CustomHandler)
        .use(CustomHandler)

      calls.should.equal(1, 'There should be only one instance created')
    })
  })


  describe(':application()', function () {

    it('should be able to set application name', function () {
      Logful.application('test')
      Logful.use('stdout')

      Logful.handlers.stdout.should.have.property('application').and.equal('test')
    })
  })
})
