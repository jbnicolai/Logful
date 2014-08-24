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
  , EventEmitter = require('events').EventEmitter
  , Logful = require(libDir + 'logful')
  , Stdout = require(libDir + 'handlers/stdout')
  , logger


describe('Logful', function () {

  beforeEach(function () {
    // Create a new instance
    logger = new Logful()
    Logful.handlers = [] // Reset the loaded handlers so we can provide configuration per test
  })


  it('should extend EventEmitter', function () {
    logger.should.be.an.instanceOf(EventEmitter)
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
      // If this triggers the event in the current tick, the event listener below will not be triggered
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
        done()
      })
    })
  })


  describe('property:level', function () {

    it('should block events below this level', function (done) {
      Logful.level.should.not.equal('debug')
      logger.on('entry', function() {
        throw new Error('debug event trigerred when threshold is set higher')
      })
      logger.log('debug', 'Hello world')
      process.nextTick(done)
    })

    it('should accept events of the same level', function (done) {
      logger.on('entry', function() {
        done()
      })
      // Log an entry of the same level as currently set as minimum
      logger.log(Logful.level, 'Hello world')
    })

    it('should throw when attempting to set to invalid level', function () {
      (function () {
        Logful.level = 'undef'
      }).should.throw()
    })

    it('should allow valid levels', function () {
      Logful.level.should.not.equal('warn')
      Logful.level = 'warn'
      Logful.level.should.equal('warn')
    })
  })


  describe('property:identity', function () {

    it('should be a combination of application and module names', function () {
      // When module name is present
      logger = new Logful('myApp')
      logger.identity.should.equal(Logful.application + '\\myApp')
      logger = new Logful()
      logger.identity.should.equal(Logful.application)
    })
  })


  describe(':isValidLevel()', function () {

    it('should return false for invalid levels', function () {
      Logful.isValidLevel('random').should.be.false
    })

    it('should return true for valid levels', function () {
      Logful.isValidLevel('info').should.be.true
    })
  })


  describe(':use()', function () {

    it('should load module from lib/handlers', function () {
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

    it('should merge configuration objects with defaults', function () {
      Logful.use('stdout', { formats: { timestamp: 'YY-MM-D' } })
      // The overriden value
      Logful.handlers.stdout.formats.timestamp.should.equal('YY-MM-D')
      // The default value
      Logful.handlers.stdout.formats.message.should.equal(Logful.formats.message)
    })
  })
})
