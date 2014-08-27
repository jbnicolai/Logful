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
  , chalk = require('chalk')
  , GenericHandler = require('./generichandler')

module.exports = Stdout

// Extend GenericHandler
util.inherits(Stdout, GenericHandler)

/**
 * The Stdout class logs all incoming messages to, surprisingly, STDOUT
 *
 * @class
 * @param     {Object}  opts           Optional configuration object to override defaults
 */
function Stdout (opts) {

  // Parent constructor
  Stdout.super_.call(this, opts)

  // Allow stdout injection for testing
  var out = arguments[1] ? arguments[1] : process.stdout


  /**
   * Log an event to STDOUT
   *
   * @param   {Logful.Entry}   event   The information about the event
   * @return  {Stdout}
   */
  this.log = function log (event) {

    // Send the processed message to STDOUT
    out.write(this.processMessage(event, this.formats.message) + '\n')

    return this
  }

  /**
   * Apply terminal colouring on the message, based on given level
   *
   * @param     {String}   message       Text to be colourised
   * @param     {String}   level         Colours will be determined by this level
   * @return    {String}                 The colourised string
   */
  this.processor =
  { message: function processMessage (message, meta) {
      return this.styles[meta.level.name](message)
    }
  , identity: function processIdentity (identity) {
      return Stdout.styles.blue(identity)
    }
  }
  this.processor.application = this.processor.identity
  this.processor.module = this.processor.identity
}

/**
 * All the Terminal colours and text decorations available to you
 *
 * This uses the {@link https://github.com/sindresorhus/chalk|Chalk} library
 *
 * @type      {Object}
 */
Stdout.styles = chalk

/**
 * Default colour styles for all severity levels
 *
 * @readonly
 * @name      Stdout.prototype.styles
 * @type      {Object}
 */
Object.defineProperty(Stdout.prototype, 'styles',
{ value:
  { emerg:  Stdout.styles.black.bold.underline.bgRed
  , alert:  Stdout.styles.red.bold.underline
  , crit:   Stdout.styles.red.underline
  , error:  Stdout.styles.red
  , warn:   Stdout.styles.yellow
  , notice: Stdout.styles.white
  , info:   Stdout.styles.reset
  , debug:  Stdout.styles.gray
  }
})

/**
 * Default formats Stdout will use when logging events
 *
 * @type {Object}
 * @property  {String}  timestamp   Timestamp format
 * @property  {String}  message     Message format
 */
Stdout.prototype.formats =
{ message: '{identity} {message}'
, timestamp: 'HH:mm:ss.SSS'
}
