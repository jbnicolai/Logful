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
  var dest = arguments[1] ? arguments[1] : process.stdout


  /**
   * Log an entry to STDOUT
   *
   * @param   {Logful.Entry}   entry   The information about the entry
   * @return  {Stdout}
   */
  this.log = function log (entry) {

    // Send the processed message to STDOUT
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
 * Default formats Stdout will use when logging entries
 *
 * @type {Object}
 * @property  {String}  timestamp   Timestamp format
 * @property  {String}  message     Message format
 */
Stdout.prototype.formats =
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
Stdout.prototype.processMessage = function processMessage (text, meta) {

  return this.styles[meta.level.name](text)
}

/**
 * Apply terminal colouring on the identity
 *
 * @param     {String}   text          Text to be colourised
 * @return    {String}                 The colourised string
 */
Stdout.prototype.processIdentity = function processIdentity (text) {

  return Stdout.styles.blue(text)
}

/**
 * Apply terminal colouring on the application
 *
 * @param     {String}   text          Text to be colourised
 * @return    {String}                 The colourised string
 */
Stdout.prototype.processApplication = Stdout.prototype.processIdentity

/**
 * Apply terminal colouring on the module
 *
 * @param     {String}   text          Text to be colourised
 * @return    {String}                 The colourised string
 */
Stdout.prototype.processModule = Stdout.prototype.processIdentity
