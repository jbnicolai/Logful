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

'use strict';

/** @private */
var moment = require('moment')
  , merge = require('merge')
  , parse = require('string-template')

module.exports = GenericHandler

function GenericHandler (opts) {

  opts = opts || {}

  // Save common configuration options into this instance
  if (opts.formats) this.formats = merge(this.formats, opts.formats)
  this.application = opts.application
}

GenericHandler.prototype.subscribe = function subscribe (emitter) {

  emitter.on('entry', function (entry) {
    this.log(entry)
  }.bind(this))
}

GenericHandler.prototype.log = function log () {

  // noop
  // Defined here in case there will be need for common logging logic in the future
}

GenericHandler.prototype.compileEntry = function compileEntry (entry, template) {

  return parse(template,
  { levelCode:      this.processItem('levelCode', entry.level.code, entry)
  , levelName:      this.processItem('levelName', entry.level.name, entry)
  , levelLongName:  this.processItem('levelLongName', entry.level.longName, entry)
  , message:        this.processItem('message', entry.message, entry)
  , timestamp:      this.processItem('timestamp', entry.timestamp, entry)
  , identity:       this.processItem('identity', entry.origin.identity, entry)
  , application:    this.processItem('application', entry.origin.application, entry)
  , module:         this.processItem('module', entry.origin.module, entry)
  , pid:            this.processItem('pid', entry.origin.pid, entry)
  })
}

GenericHandler.prototype.processItem = function processItem (item, value, meta) {

  // Capitalise the first char of the item and prepend "process", i.e. processLevelCode
  var itemProcessor =
    'process' +
    item.charAt(0).toUpperCase() + // The first char, upper-cased
    item.slice(1) // The remainder of the string, except the first char

  // Check if a processing function is defined on the current object and call it
  if (typeof this[itemProcessor] === 'function')
    return this[itemProcessor].call(this, value, meta) // Preserve current context

  return value
}

GenericHandler.prototype.processTimestamp = function processTimestamp (value) {

  return moment(value).format(this.formats.timestamp)
}
