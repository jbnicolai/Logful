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

var Logful = require('../lib/logful')
  , fs = require('fs')
  , logger

suite('File', function () {
  set('type', 'static')
  set('iterations', 10000)

  Logful
    .application('Matcha')
    .use('file', { path: __dirname + '/out.log' })

  logger = new Logful('fileBench')

  bench('write', function () {
    logger.info('benchmarking message. Please ignore.')
  })

  after(function () {
    // Clean up the log file
    fs.unlinkSync(__dirname + '/out.log')
  })
})
