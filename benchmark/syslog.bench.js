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
  , logger

suite('Syslog', function () {
  set('type', 'static')
  set('iterations', 10000)

  Logful
    .application('Matcha')
    .use('syslog')

  logger = new Logful('syslogBench')

  bench('write', function () {
    logger.info('benchmarking message. Please ignore.')
  })
})
