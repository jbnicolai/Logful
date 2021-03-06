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

/**
 * Implements basic logic necessary for all handlers and all handlers should inherit from this class
 *
 * @class
 * @param   {Object}    opts                    Optional arguments to be passed to the handler
 * @param   {Object}    opts.formats            Override default formats for the logging handler
 * @param   {String}    opts.formats.message    The default message format
 * @param   {String}    opts.formats.timestamp  The default timestamp format
 */
function GenericHandler (opts) {

  opts = opts || {}

  // Save common configuration options into this instance
  if (opts.formats) this.formats = merge(this.formats, opts.formats)
  this.application = opts.application
}

/**
 * Make the handler listen to "entry" events of given emitter
 *
 * @param  {EventEmitter} emitter The emitter to add the listener to
 * @return {GenericHandler}
 */
GenericHandler.prototype.subscribe = function subscribe (emitter) {

  emitter.on('entry', function (entry) {
    this.log(entry)
  }.bind(this))

  return this
}

/**
 * Log the entry to the destination
 *
 * @param     {Logful.Entry}  entry    The entry object to be logged
 * @return    {void}
 */
GenericHandler.prototype.log = function log () {

  // noop
  // Defined here in case there will be need for common logging logic in the future
}

/**
 * Create a single string from the entry object, according to given template
 *
 * @param     {Logful.Entry}  entry     The entry object to be processed
 * @param     {String}        template  The string template which specifies how the data should be
 *                                      represented
 * @return    {String}                  The processed string, ready to be logged
 */
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

/**
 * Process a single item from the entry
 *
 * @param     {String}        item      Name of the item
 * @param     {String}        value     Value of the item
 * @param     {Logful.Entry}  meta      The entry being logged
 * @return    {String}                  The processed item
 */
GenericHandler.prototype.processItem = function processItem (item, value, meta) {

  // Capitalise the first char of the item and prepend "process", i.e. processLevelCode
  var itemProcessor =
    'process' +
    item.charAt(0).toUpperCase() + // The first char, upper-cased
    item.slice(1) // The remainder of the string, except the first char

  // Check if a processing function is defined on the current object and call it
  if (typeof this[itemProcessor] === 'function') {
    return this[itemProcessor](value, meta)
  }

  return value
}

/**
 * Format the timestamp object into a specific date/time format string
 *
 * @param     {Date}          value     Date object to be formatted
 * @return    {String}                  The formatted date
 */
GenericHandler.prototype.processTimestamp = function processTimestamp (value) {

  return moment(value).format(this.formats.timestamp)
}
