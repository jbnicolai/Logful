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
}

GenericHandler.prototype.processor = {}

GenericHandler.prototype.formats = {}

GenericHandler.prototype.subscribe = function subscribe (emitter) {

  emitter.on('entry', function (entry) {
    this.log(entry)
  }.bind(this))
}

GenericHandler.prototype.log = function log () {

  // noop
  // Defined here in case there will be need for common logging logic in the future
}

GenericHandler.prototype.processMessage = function processMessage (entry, template) {

  return parse(template,
  { levelCode:      this.processTemplateItem('levelCode', entry.level.code, entry)
  , levelName:      this.processTemplateItem('levelName', entry.level.name, entry)
  , levelLongName:  this.processTemplateItem('levelLongName', entry.level.longName, entry)
  , message:        this.processTemplateItem('message', entry.message, entry)
  , timestamp:      this.processTemplateItem('timestamp', entry.timestamp, entry)
  , identity:       this.processTemplateItem('identity', entry.origin.identity, entry)
  , application:    this.processTemplateItem('application', entry.origin.application, entry)
  , module:         this.processTemplateItem('module', entry.origin.module, entry)
  })
}

GenericHandler.prototype.processTemplateItem = function processTemplateItem (item, value, meta) {

  // Check if a processing function is defined in the this.processor scope and call it
  if (typeof this.processor[item] === 'function')
    return this.processor[item].call(this, value, meta) // Preserve current context

  return value
}

GenericHandler.prototype.processor.timestamp = function processTimestamp (value) {

  return moment(value).format(this.formats.timestamp)
}
