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

module.exports = GenericModule

function GenericModule (opts) {

  opts = opts || {}

  // Save common configuration options into this instance
  if (opts.formats) this.formats = opts.formats
}

GenericModule.prototype.subscribe = function subscribe (emitter) {

  emitter.on('entry', function (entry) {
    this.log(entry)
  }.bind(this))
}

GenericModule.prototype.log = function log () {

  // noop
  // Defined here in case there will be need for common logging logic in the future
}

GenericModule.prototype.formatTimestamp = function formatTimestamp (timestamp) {

  return moment(timestamp).format(this.formats.timestamp)
}
