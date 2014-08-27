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
var util = require('util')
  , syslogStream = require('syslog-stream')
  , GenericHandler = require('./generichandler')

module.exports = Syslog

// Extend GenericHandler
util.inherits(Syslog, GenericHandler)

/**
 * The Syslog class logs all incoming messages to, surprisingly, Syslog
 *
 * @class
 * @param     {Object}  opts           Optional configuration object to override defaults
 */
function Syslog (opts) {

  // Parent constructor
  Syslog.super_.call(this, opts)

  // Allow stdout injection for testing
  var out = arguments[1] ? arguments[1] : syslogStream()

  /**
   * Log an event to Syslog
   *
   * @param   {Logful.Entry}   event   The information about the event
   * @return  {Syslog}
   */
  this.log = function log (event) {

    // Send the processed message to Syslog
    out.log(event.level.name, this.processMessage(event, this.formats.message))

    return this
  }
}

/**
 * Default formats Syslog will use when logging events
 *
 * @type {Object}
 * @property  {String}  message     Message format
 * @property  {String}  timestamp   Timestamp format
 */
Syslog.prototype.formats =
{ message: '{module}: {message}'
, timestamp: 'HH:mm:ss.SSS'
}
