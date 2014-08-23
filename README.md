# logful
[![NPM Version](https://badge.fury.io/js/logful.png)](https://npmjs.org/package/logful)
[![Build Status](https://travis-ci.org/BeBe/logful.svg)](http://travis-ci.org/BeBe/logful)
[![Built with Grunt](https://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com)

> Logging everywhere, made simple and still configurable

** Project still under heavy development!**

## Installation Instructions

Install the module via npm: `npm install logful [--save]`

## Usage

In your code, you tell Logful once where you would like to receive logged messages:

```js
var Logful = require('logful')
Logful.use('stdout') // log messages to console, using the built-in stdout module
```

And now you just create instances wherever necessary:

```js
var logger = new Logful()
logger.warn('this will be printed to stdout')
```

More information will be provided as the API settles and features are finalised.

## License

This software is licensed under the **BSD-3-Clause License**. See the [LICENSE](LICENSE) file for more information.