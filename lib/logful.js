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
  , minLevel = 'info'
  , application = 'node'
  , EventEmitter = require('events').EventEmitter

module.exports = Logful

// Extend EventEmitter
util.inherits(Logful, EventEmitter)

/**
 * Create a new logging instance
 *
 * @class
 * @extends {EventEmitter}
 * @see     {@link http://nodejs.org/api/events.html#events_class_events_eventemitter|EventEmitter}
 * @param   {String}  module          Name of the module/function which this instance will use
 *                                    to identify itself
 */
function Logful (module) {

  // Parent constructor
  Logful.super_.call(this)

  /**
   * The module name of the instance
   *
   * @readonly
   * @name  Logful.prototype.module
   * @type  {String}
   */
  Object.defineProperty(this, 'module', { enumerable: true, value: module })

  /**
   * The instance's identity - a combination of application's and module's name
   *
   * @readonly
   * @name  Logful.prototype.identity
   * @type  {String}
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
 * @see       {@link http://en.wikipedia.org/wiki/Syslog#Severity_levels|Syslog - Severity levels}
 */

/**
 * Known severity levels
 *
 * @readonly
 * @memberOf  Logful
 * @enum      {Logful.Severity}   severities  Each key in this object contains a known severity
 *                                            level and its metadata
 */
var severities = {
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

// Freeze the severities object
Object.defineProperty(
  Logful
, 'severities'
, { enumerable: true
  , value: Object.freeze(severities)
  }
)

/**
 * Logging handlers to be notified when new entries are added
 *
 * @private
 * @readonly
 * @name      Logful.handlers
 * @type      {Array}
 * @default   []
 */
Object.defineProperty(Logful, 'handlers', { value: [], writable: true })

/**
 * Only entries of this or higher level will be logged
 *
 * Note that entries below this level will not be emitted at all
 *
 * @param     {String}  level     The new log level
 * @default   info
 * @return    {Logful}
 */
Logful.level = function setLevel (level) {

  // Is this a known level?
  if (! Logful.severities[level]) {
    throw new Error(util.format('"%s" is not a supported severity level', level))
  }

  minLevel = level

  return Logful
}

/**
 * Set application name
 *
 * Logful will provide this information to logging handlers to help them distinguish your
 * application's entries
 *
 * @param     {String}  name      The new application name to be used
 * @default   node
 * @return    {Logful}
 */
Logful.application = function setApplication (name) {

  application = name

  return Logful
}

/**
 * Load a logging handler and configure it for use
 *
 * @param     {String|Function}  handler   The handler to load - must be either a valid handler in
 *                                         the lib/handlers folder or a constructor function
 * @param     {Object}  opts               Configuration options - these will be passed directly to
 *                                         the logging handler
 * @return    {Logful}
 */
Logful.use = function use (handler, opts) {

  var name = handler.toString()
    , Handler

  // Do nothing if this handler is already being used
  if (Logful.handlers[name]) {
    return Logful
  }

  // Normalise opts
  opts = opts || {}
  // Attach the application name
  opts.application = application

  // Load and configure the handler

  // Is handler a string or a constructor function?
  Handler = typeof handler === 'string' ? require('./handlers/' + handler) : handler
  Logful.handlers[name] = new Handler(opts)

  return Logful
}

/**
 * Send the message to configured handlers
 *
 * This function is used by the individual logging functions to provide common processing logic.
 * You should not need to call it directly.
 *
 * @private
 * @param  {String}       level     Severity level of the message
 * @param  {String|Error} message   The message to be logged or an instance of Error. You can also
 *                                  use a printf-like syntax, i.e.
 *                                  logger.log('info', 'Hello %s', 'world')
 * @fires  Logful#entry
 * @return {Logful}
 */
Logful.prototype.log = function log (level, message) {

  // Info about current severity level
  var severity = Logful.severities[level]
  // This object will be emitted to the logging interfaces
    , entry

  // Is the message an Error?
  if (message instanceof Error) {
    message = message.message
  }

  // Is the message a printf-like array, e.g.['hello %s', 'world'] ?
  if (typeof message === 'object') {
    message = util.format.apply(util, message)
  }

  // Validate log level
  if (! Logful.severities[level]) {
    // Invalid log level -> emit a warning (this is most likely a programmer's mistake)
    return this.warn(
      '"%s" is not a supported severity level (original message: "%s")'
      , level
      , message
    )
  }

  // What is the minimum severity level? Are we at or above it?
  // Highest severity has lowest number
  if (severity.code > Logful.severities[minLevel].code) {
    // noop - severity level too low
    return this
  }

  /**
   * Information that loggers receive when a new log entry is added
   *
   * @typedef   Logful.Entry
   * @property  {Object}   level               Severity metadata
   * @property  {String}   level.code          Severity code of the message, appropriate to the
   *                                           level specified
   * @property  {String}   level.name          Severity level of the message (i.e. warn)
   * @property  {String}   level.longName      Severity level of the message, full (i.e. Warning)
   * @property  {String}   message             The actual message being logged
   * @property  {Date}     timestamp           Date and time when the entry was logged
   * @property  {Object}   origin              Information about the source of the entry
   * @property  {String}   origin.identity     Combination of application's and module's name, in
   *                                           the form App\Module
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

  // Emit the event in the current tick... Yes, I am serious - current tick.
  this.emit('entry', entry)

  // Allow chaining
  return this
}

/**
 * Log a debug level message
 *
 * @param  {String|Error} message   The message to be logged or an instance of Error. You can also
 *                                  use a printf-like syntax, i.e. logger.debug('Hello %s', 'world')
 * @fires  Logful#entry
 * @return {Logful}
 */
Logful.prototype.debug = function debug () {

  return this.log('debug', arguments)
}

/**
 * Log an info level message
 *
 * @param  {String|Error} message   The message to be logged or an instance of Error. You can also
 *                                  use a printf-like syntax, i.e. logger.info('Hello %s', 'world')
 * @fires  Logful#entry
 * @return {Logful}
 */
Logful.prototype.info = function info () {

  return this.log('info', arguments)
}

/**
 * Log a notice level message
 *
 * @param  {String|Error} message   The message to be logged or an instance of Error. You can also
 *                                  use a printf-like syntax, i.e.
 *                                  logger.notice('Hello %s', 'world')
 * @fires  Logful#entry
 * @return {Logful}
 */
Logful.prototype.notice = function notice () {

  return this.log('notice', arguments)
}

/**
 * Log a warning level message
 *
 * @param  {String|Error} message   The message to be logged or an instance of Error. You can also
 *                                  use a printf-like syntax, i.e. logger.warn('Hello %s', 'world')
 * @fires  Logful#entry
 * @return {Logful}
 */
Logful.prototype.warn = function warn () {

  return this.log('warn', arguments)
}

/**
 * Alias for {@link Logful#warn}
 *
 * @method Logful.prototype.warning
 * @param  {String|Error} message   The message to be logged or an instance of Error. You can also
 *                                  use a printf-like syntax, i.e.
 *                                  logger.warnin('Hello %s', 'world')
 * @fires  Logful#entry
 * @return {Logful}
 */
Logful.prototype.warning = Logful.prototype.warn

/**
 * Log a error level message
 *
 * @param  {String|Error} message   The message to be logged or an instance of Error. You can also
 *                                  use a printf-like syntax, i.e. logger.error('Hello %s', 'world')
 * @fires  Logful#entry
 * @return {Logful}
 */
Logful.prototype.error = function error () {

  return this.log('error', arguments)
}

/**
 * Log a critical level message
 *
 * @param  {String|Error} message   The message to be logged or an instance of Error. You can also
 *                                  use a printf-like syntax, i.e. logger.crit('Hello %s', 'world')
 * @fires  Logful#entry
 * @return {Logful}
 */
Logful.prototype.crit = function crit () {

  return this.log('crit', arguments)
}

/**
 * Alias for {@link Logful#crit}
 *
 * @method Logful.prototype.critical
 * @param  {String|Error} message   The message to be logged or an instance of Error. You can also
 *                                  use a printf-like syntax, i.e.
 *                                  logger.critical('Hello %s', 'world')
 * @fires  Logful#entry
 * @return {Logful}
 */
Logful.prototype.critical = Logful.prototype.crit

/**
 * Log a alert level message
 *
 * @param  {String|Error} message   The message to be logged or an instance of Error. You can also
 *                                  use a printf-like syntax, i.e. logger.alert('Hello %s', 'world')
 * @fires  Logful#entry
 * @return {Logful}
 */
Logful.prototype.alert = function alert () {

  return this.log('alert', arguments)
}

/**
 * Log a emergency level message
 *
 * @param  {String|Error} message   The message to be logged or an instance of Error. You can also
 *                                  use a printf-like syntax, i.e. logger.emerg('Hello %s', 'world')
 * @fires  Logful#entry
 * @return {Logful}
 */
Logful.prototype.emerg = function emerg () {

  return this.log('emerg', arguments)
}

/**
 * Alias for {@link Logful#emerg}
 *
 * @method Logful.prototype.emergency
 * @param  {String|Error} message   The message to be logged or an instance of Error. You can also
 *                                  use a printf-like syntax, i.e.
 *                                  logger.emergency('Hello %s', 'world')
 * @fires  Logful#entry
 * @return {Logful}
 */
Logful.prototype.emergency = Logful.prototype.emerg

/**
 * Alias for {@link Logful#emerg}
 *
 * @method Logful.prototype.panic
 * @param  {String|Error} message   The message to be logged or an instance of Error. You can also
 *                                  use a printf-like syntax, i.e. logger.panic('Hello %s', 'world')
 * @fires  Logful#entry
 * @return {Logful}
 */
Logful.prototype.panic = Logful.prototype.emerg
