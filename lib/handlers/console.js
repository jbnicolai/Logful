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

module.exports = Console

// Extend GenericHandler
util.inherits(Console, GenericHandler)

/**
 * The Console class logs all incoming messages to, surprisingly, STDERR
 *
 * @class
 * @extends   {GenericHandler}
 * @param     {Object}  opts           Optional configuration object to override defaults
 */
function Console (opts) {

  // Parent constructor
  Console.super_.call(this, opts)

  // Allow api injection for testing
  var dest = arguments[1] ? arguments[1] : process.stderr

  /**
   * Log an entry to stderr
   *
   * @param   {Logful.Entry}   entry   The information about the entry
   * @return  {Console}
   */
  this.log = function log (entry) {

    // Send the processed message to stderr
    dest.write(this.compileEntry(entry, this.formats.message) + '\n')

    return this
  }
}

/**
 * All the Terminal colours and text decorations available to you
 *
 * This uses the {@link https://github.com/sindresorhus/chalk|Chalk} library
 *
 * @type      {Object}
 */
Console.styles = chalk

/**
 * Default colour styles for all severity levels
 *
 * @readonly
 * @name      Console.prototype.styles
 * @type      {Object}
 */
Object.defineProperty(Console.prototype, 'styles',
{ value:
  { emerg:  Console.styles.black.bold.underline.bgRed
  , alert:  Console.styles.red.bold.underline
  , crit:   Console.styles.red.underline
  , error:  Console.styles.red
  , warn:   Console.styles.yellow
  , notice: Console.styles.white
  , info:   Console.styles.reset
  , debug:  Console.styles.gray
  }
})

/**
 * Default formats Console will use when logging entries
 *
 * @type {Object}
 * @readonly
 * @property  {String}  timestamp   Timestamp format
 * @property  {String}  message     Message format
 */
Console.prototype.formats =
{ message: '{identity} {message}'
, timestamp: 'HH:mm:ss.SSS'
}

/**
 * Apply terminal colouring on the message, based on given level
 *
 * @param     {String}   text          Text to be colourised
 * @param     {String}   level         Colours will be determined by this level
 * @return    {String}                 The colourised string
 */
Console.prototype.processMessage = function processMessage (text, meta) {

  return this.styles[meta.level.name](text)
}

/**
 * Apply terminal colouring on the identity name
 *
 * @param     {String}   text          Text to be colourised
 * @return    {String}                 The colourised string
 */
Console.prototype.processIdentity = function processIdentity (text) {

  return Console.styles.blue(text)
}

/**
 * Apply terminal colouring on the application name
 *
 * @method    Console.prototype.processApplication
 * @param     {String}   text          Text to be colourised
 * @return    {String}                 The colourised string
 */
Console.prototype.processApplication = Console.prototype.processIdentity

/**
 * Apply terminal colouring on the module name
 *
 * @method    Console.prototype.processModule
 * @param     {String}   text          Text to be colourised
 * @return    {String}                 The colourised string
 */
Console.prototype.processModule = Console.prototype.processIdentity
