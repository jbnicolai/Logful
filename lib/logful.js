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
  , application = 'node'
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
 * @param     {String}  module          Name of the module/function which this instance will use to identify itself
 */
function Logful (module) {

  // Parent constructor
  Logful.super_.call(this)

  /**
   * The module name of the instance
   *
   * @readonly
   * @type    {String}
   */
  this.module = module

  /**
   * The instance's identity - a combination of application's and module's name
   *
   * @readonly
   * @type    {String}
   */
  Object.defineProperty(this, 'identity',
  { get: function getIdentity () {
      var identity = application
      if (this.module) identity += '\\' + this.module

      return identity
    }
  , enumerable: true
  })

  // Subscribe all loaded handlers to events emitted by this instance
  for (var handler in Logful.handlers) {
    Logful.handlers[handler].subscribe(this)
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
 * Logging handlers to be notified when new entries are added
 *
 * @readonly
 * @type      {Array}
 * @default   []
 */
Logful.handlers = []

/**
 * Only entries of this or higher level will be logged
 *
 * Note that entries below this level will not be emitted at all
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
 * Set application name
 *
 * Logful will provide this information to logging interfaces to help them distinguish your application's entries
 *
 * @param     {String}  name      The new application name to be used
 * @return    {Logful}
 */
Logful.application = function setApplication (name) {

  application = name

  return Logful
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
 * Load a logging handler and configure it for use
 *
 * @param     {String}  handler   The handler name to load - must be a valid handler in the lib/handlers folder
 * @param     {Object}  opts      Configuration options - these will be passed directly to the logging handler
 * @return    {Logful}
 */
Logful.use = function use (handler, opts) {

  // Do nothing if this handler is already being used
  if (Logful.handlers[handler])
    return Logful

  // Normalise opts
  opts = opts || {}
  // Attach the application name
  opts.application = application

  // Load and configure the handler
  var Logger = require('./handlers/' + handler)
  var logger = new Logger(opts)
  Logful.handlers[handler] = logger

  return Logful
}

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
   * @typedef   Logful.Entry
   * @property  {Object}   level               Severity metadata
   * @property  {String}   level.code          Severity code of the message, appropriate to the level specified
   * @property  {String}   level.name          Severity level of the message (warn)
   * @property  {String}   level.longName      Severity level of the message, full (Warning)
   * @property  {String}   message             The original message being logged
   * @property  {Date}     timestamp           Date and time when the entry was logged
   * @property  {Object}   origin              Information about the source of the entry
   * @property  {String}   origin.identity     Combination of application's and module's name, in the form App\Module
   * @property  {String}   origin.application  The source application's name
   * @property  {String}   origin.module       The source application module's name
   * @property  {Number}   origin.pid          The ID of the process which logged the entry
   */

  /**
   * The event fired when a new log entry is added
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
    { identity:     this.identity         // i.e. MyAwesomeApp\MyFileManager
    , application:  application           // i.e. MyAwesomeApp
    , module:       this.module           // i.e. MyFileManager
    , pid:          process.pid           // i.e. 4053
    }
  }

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
