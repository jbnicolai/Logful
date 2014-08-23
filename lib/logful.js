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
  , level = 'info'
  , EventEmitter = require('events').EventEmitter

module.exports = Logful

// Extend EventEmitter
util.inherits(Logful, EventEmitter)

/**
 * Create a new instance of the Logful object
 *
 * @class
 * @extends   {EventEmitter}
 * @see       {@link http://nodejs.org/api/events.html#events_class_events_eventemitter|Node.js docs - EventEmitter}
 * @param     {String}  identity        Name of the module/function which this instance will use to identify itself
 */
function Logful (identity) {

  // Parent constructor
  Logful.super_.call(this)

  /**
   * The identity of the instance
   *
   * @readonly
   * @type    {String}
   */
  this.identity = identity

  // Subscribe all loaded modules to events emitted by this instance
  for (var module in Logful.modules) {
    Logful.modules[module].subscribe(this)
  }
}

/**
 * A severity definition
 *
 * @typedef   {Object}  Logful.Severity
 * @property  {Int}     code            Severity code associated with this level
 * @property  {String}  shortName       A short version of the severity name
 * @property  {String}  longName        Severity name for humans
 * @see       {@link http://en.wikipedia.org/wiki/Syslog#Severity_levels|Syslog - Severity levels} for more information
 *            about severity levels
 */

/**
 * Known severity levels
 *
 * @readonly
 * @enum      {Logful.Severity}   severities  Each key in this object contains a known severity level and its metadata
 */
Logful.severities =
{
  /** System is unusable */
  emerg:  { code: 0, shortName: 'emerg',  longName: 'Emergency' },
  /** Action must be taken immediately */
  alert:  { code: 1, shortName: 'alert',  longName: 'Alert' },
  /** Critical conditions */
  crit:   { code: 2, shortName: 'crit',   longName: 'Critical' },
  /** Error conditions */
  error:  { code: 3, shortName: 'error',  longName: 'Error' },
  /** Warning conditions */
  warn:   { code: 4, shortName: 'warn',   longName: 'Warning' },
  /** Normal but significant condition */
  notice: { code: 5, shortName: 'notice', longName: 'Notice' },
  /** Informational messages */
  info:   { code: 6, shortName: 'info',   longName: 'Info' },
  /** Debug-level messages */
  debug:  { code: 7, shortName: 'debug',  longName: 'Debug' }
}

/**
 * Application name
 *
 * Logful will provide this information to logging interfaces to help them distinguish your application's entries
 *
 * @readonly
 * @type      {String}
 * @default   node
 */
Logful.application = 'node'

/**
 * Logging modules to be notified when new entries are added
 *
 * @readonly
 * @type      {Array}
 * @default   []
 */
Logful.modules = []

/**
 * Only events of this or higher level will be logged
 *
 * Note that events below this level will not be emitted at all
 *
 * @name      Logful.level
 * @readonly
 * @type      {String}
 * @default   info
 */
Object.defineProperty(Logful, 'level',
{ enumerable: true
, get: function getLevel () { return level }
, set: function setLevel (newLevel) {
    // Is this a known level?
    if (! Logful.isValidLevel(newLevel)) {
      throw new Error(util.format('"%s" is not a supported severity level', newLevel))
    }

    level = newLevel
  }
})

/**
 * Default formats Logful will use when logging events
 *
 * @type {Object}
 * @property  {String}  timestamp   Timestamp format
 * @property  {String}  message     Message format
 */
Logful.formats =
{ timestamp: 'HH:mm:ss,SSS'
, message: '{identity} {timestamp} {message}'
}

/**
 * Check if the given severity level is known to Logful
 *
 * @param     {String}  level The level (as string) to be checked
 * @return    {Boolean}
 */
Logful.isValidLevel = function isValidLevel (level) {

  return !! Logful.severities[level]
}

/**
 * Load a logging module and configure it for use
 *
 * @param     {String}  module    The module name to load - must be a valid module in the lib/modules folder
 * @param     {Object}  opts      Configuration options - these will be passed directly to the logging module
 * @return    {Logful}
 */
Logful.use = function use (module, opts) {

  // Normalise opts
  opts = opts || {}
  opts.formats = opts.formats ? opts.formats : Logful.formats

  var Logger = require('./modules/' + module)
  var logger = new Logger(opts)
  Logful.modules[module] = logger

  return Logful
}

/**
 * Information that loggers receive when a new log entry is added
 *
 * @typedef   Logful.Entry
 * @property  {Object}   level               Severity metadata
 * @property  {String}   level.code          Severity code of the message, appropriate to the level specified
 * @property  {String}   level.name          Severity level of the message (warn)
 * @property  {String}   level.longName      Severity level of the message, full (Warning)
 * @property  {String}   message             The original message being logged
 * @property  {Date}     timestamp           Date and time when the entry was logged
 * @property  {Object}   origin              Information about the source of the event
 * @property  {String}   origin.application  The source application's name
 * @property  {String}   origin.module       The source application module's name
 */

/**
 * Send the message to configured targets
 *
 * This function is used by the individual logging functions to provide common processing logic.
 *
 * @param  {String}  level        Severity level of the message
 * @param  {String}  message      The message to be logged
 * @fires  Logful#entry
 * @return {Logful}
 */
Logful.prototype.log = function log (level, message) {

  // Scope
  var that = this
  // Info about current severity level
    , severity = Logful.severities[level]
  // This object will be emitted to the logging interfaces
    , entry

  // Validate log level
  if (! Logful.isValidLevel(level)) {
    // Invalid log level -> emit a warning (this is most likely a programmer's mistake)
    return this.warn(
      util.format(
        '"%s" is not a supported severity level (original message: "%s")'
      , level
      , message
      )
    )
  }

  // What is the minimum severity level? Are we at or above it?
  // Highest severity has lowest number
  if (severity.code > Logful.severities[Logful.level].code) {
    // noop
    return this
  }

  /**
   * Information that loggers receive when a new log entry is added
   *
   * @event  Logful#entry
   * @param  {Logful.Entry}   entry     The data being logged
   */
  entry =
  { level:
    { code:         severity.code         // i.e. 4
    , name:         severity.shortName    // i.e. warn
    , longName:     severity.longName     // i.e. Warning
    }
  , message:        message               // i.e. Something strange happened, but continuing anyway
  , timestamp:      new Date()            // i.e. Fri Aug 22 2014 20:56:10 GMT+0200 (CEST)
  , origin:
    { application:  Logful.application    // i.e. MyAwesomeApp
    , module:       this.identity         // i.e. MyFileManager
    }
  }

  // TODO - consider if it's good idea to emit the event in the next tick instead of immediately...
  process.nextTick(function () {
    that.emit('entry', entry)
  })

  // Allow chaining
  return this
}

/**
 * Log a debug level message
 *
 * @param  {String}   message     The message to be logged
 * @return {Logful}
 */
Logful.prototype.debug = function debug (message) {

  return this.log('debug', message)
}

/**
 * Log an info level message
 *
 * @param  {String}   message     The message to be logged
 * @return {Logful}
 */
Logful.prototype.info = function info (message) {

  return this.log('info', message)
}

/**
 * Log a notice level message
 *
 * @param  {String}   message     The message to be logged
 * @return {Logful}
 */
Logful.prototype.notice = function notice (message) {

  return this.log('notice', message)
}

/**
 * Log a warning level message
 *
 * @param  {String}   message     The message to be logged
 * @return {Logful}
 */
Logful.prototype.warn = function warn (message) {

  return this.log('warn', message)
}

/**
 * Alias for {@link Logful#warn}
 *
 * @method Logful.prototype.warning
 * @param  {String}   message     The message to be logged
 * @return {Logful}
 */
Logful.prototype.warning = Logful.prototype.warn

/**
 * Log a error level message
 *
 * @param  {String}   message     The message to be logged
 * @return {Logful}
 */
Logful.prototype.error = function error (message) {

  return this.log('error', message)
}

/**
 * Log a critical level message
 *
 * @param  {String}   message     The message to be logged
 * @return {Logful}
 */
Logful.prototype.crit = function crit (message) {

  return this.log('crit', message)
}

/**
 * Alias for {@link Logful#crit}
 *
 * @method Logful.prototype.critical
 * @param  {String}   message     The message to be logged
 * @return {Logful}
 */
Logful.prototype.critical = Logful.prototype.crit

/**
 * Log a alert level message
 *
 * @param  {String}   message     The message to be logged
 * @return {Logful}
 */
Logful.prototype.alert = function alert (message) {

  return this.log('alert', message)
}

/**
 * Log a emergency level message
 *
 * @param  {String}   message     The message to be logged
 * @return {Logful}
 */
Logful.prototype.emerg = function emerg (message) {

  return this.log('emerg', message)
}

/**
 * Alias for {@link Logful#emerg}
 *
 * @method Logful.prototype.emergency
 * @param  {String}   message     The message to be logged
 * @return {Logful}
 */
Logful.prototype.emergency = Logful.prototype.emerg