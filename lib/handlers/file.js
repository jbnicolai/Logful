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
  , fs = require('fs')
  , merge = require('merge')
  , GenericHandler = require('./generichandler')

module.exports = File

// Extend GenericHandler
util.inherits(File, GenericHandler)

/**
 * The File class logs all incoming messages to, surprisingly, a file
 *
 * @class
 * @extends   {GenericHandler}
 * @param     {Object}  opts           Configuration for the File handler
 * @param     {String}  opts.path      Path to a file where entries should be appended
 * @param     {Object}  opts.fsOpts    Additional configuration object which will be passed directly
 *            to {@link http://nodejs.org/api/fs.html#fs_fs_createwritestream_path_options
 *            |fs.createWriteStream}
 */
function File (opts) {

  // Normalise args
  opts = opts || {}
  opts.fsOpts = opts.fsOpts || {}

  // Parent constructor
  File.super_.call(this, opts)

  // Generate options object for fs
  var fsOpts = merge(
  { flags: 'a'          // Open file for appending and create it if it does not exist
  , encoding: 'utf8'
  }, opts.fsOpts)
  // Allow WritableStream injection for testing
  var dest = arguments[1] ? arguments[1] : fs.createWriteStream(opts.path, fsOpts)

  /**
   * Log an entry to File
   *
   * @param   {Logful.Entry}   entry   The information about the entry
   * @return  {File}
   */
  this.log = function log (entry) {

    // Send the processed message to file
    dest.write(this.compileEntry(entry, this.formats.message) + '\n')

    return this
  }
}

/**
 * Default formats File will use when logging entries
 *
 * @type {Object}
 * @readonly
 * @property  {String}  message     Message format
 * @property  {String}  timestamp   Timestamp format
 */
File.prototype.formats =
{ message: '{timestamp}\t{levelName}\t{identity}:\t{message}'
, timestamp: 'YYYY-MM-DD HH:mm:ss.SSS'
}
