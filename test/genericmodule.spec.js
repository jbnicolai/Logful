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
  , GenericModule = require(libDir + 'modules/genericmodule')
  , genericModule

describe('GenericModule', function () {

  beforeEach(function () {
    // Create a new instance
    genericModule = new GenericModule()
  })


  describe('.subscribe()', function () {

    it('subscribes itself to the "entry" event of given emitter', function () {
      var emitter = new EventEmitter()
      genericModule.subscribe(emitter)

      emitter.listeners('entry').length.should.equal(1)
    })

    it('should hand the event data over to .log() method', function (done) {
      var emitter = new EventEmitter()
      genericModule.subscribe(emitter)

      genericModule.log = done
      emitter.emit('entry')
    })
  })
})
