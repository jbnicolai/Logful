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
 * @param {Object}  opts              Optional configuration object to override defaults
 */
function Stdout (opts) {

  // Parent constructor
  Stdout.super_.call(this, opts)

  // Allow stdout injection for testing
  var out = arguments[1] ? arguments[1] : process.stdout


  /**
   * Log an event to STDOUT
   *
   * @param  {Logful.Entry}   event   The information about the event
   * @return {Stdout}
   */
  this.log = function log (event) {

    var message

    // Assemble the message
    message = util.format(
      '%s (%s) %s'
    , chalk.blue(util.format('%s\\%s', event.origin.application, event.origin.module))
    , this.formatTimestamp(event.timestamp)
    , this.colourise(event.message, event.level.name)
    )
    // Send the message to STDOUT
    out.write(message + '\n')

    return this
  }
}

/**
 * Default colour styles for all severity levels
 *
 * @readonly
 * @type {Object}
 */
Object.defineProperty(Stdout.prototype, 'styles',
{ value:
  { emerg:  chalk.black.bold.underline.bgRed
  , alert:  chalk.red.bold.underline
  , crit:   chalk.red.underline
  , error:  chalk.red
  , warn:   chalk.yellow
  , notice: chalk.white
  , info:   chalk.reset
  , debug:  chalk.gray
  }
})

/**
 * Apply terminal colouring on the message, based on given level
 *
 * @param  {String}   message   Text to be colourised
 * @param  {String}   level     Colours will be determined by this level
 * @return {String}             The colourised string
 */
Stdout.prototype.colourise = function colourise (message, level) {

  return this.styles[level](message)
}
