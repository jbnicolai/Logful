# Logful
[![NPM Version][npm-badge]][npm-url]
[![Build Status][travis-badge]][travis-url]
[![Coverage Status][coveralls-badge]][coveralls-url]
[![Built with Grunt][grunt-badge]][grunt-url]

> Logging everywhere, made simple and still configurable

## About

Logful is a logging library which follows the [Syslog severity levels](http://www.wikipedia.org/wiki/Syslog#Severity_levels) and allows you to easily select, swap or combine logging destinations. It has several built-in logging handlers and it is easy to write your own.

## Installation Instructions

Install the module via **npm**: `npm install logful [--save]`

## Usage

The most powerful feature of Logful is the possibility to use multiple logging destinations at the same time:

```js
var Logful = require('logful')
// This needs to be done only once
Logful
  .use('console')
  .use('syslog')

// somewhere where you actually need to log something...
var logger = new Logful()
logger.info('this will be logged to console and Syslog!')
```

### Included handlers

- `console` - send messages to the console
- `file` - log messages to a log file
- `syslog` - send messages to Syslog

## Examples

Logful tries to provide reasonable defaults, but if you like, you can customise almost all aspects of its behaviour.

### Logful.application()

Logful uses the application name to distinguish your application from others, i.e. in Syslog.

**Default:** *node*

```js
Logful.application('MyApp') // Set a new application's name
```

### Logful.level()

Specify the minimum severity level at which messages should start being logged.

**Default:** *info*

```js
Logful.level('warn') // debug, info and notice will be ignored
```

### Logful.use()

Tell Logful where to send your messages.

**Default:** */dev/null* (messages are ignored if you do not specify a destination)

```js
Logful.use('file', { path: './logfile' })
```

### new Logful()

Create a new instance and start logging! Optionally, you can provide a module name to this instance so that each of you modules' entries will be easily recognisable.

```js
var logger = new Logful('MyModule')
```

### Logging methods

Here is the list of all the methods you  can use in your code to log your messages at various severity levels.

```js
logger
  .debug()
  .info()
  .notice()
  .warn()   // or .warning()
  .error()
  .alert()
  .crit()   // or .critical()
  .emerg()  // or .emergency() or .panic()
```

## Performance

All the built-in handlers are implemented using Streams, so sending a message to all available log handlers will not slow your code execution. If you wish to see how fast you can go, run the included benchmarks:

- git checkout https://github.com/Dreamscapes/Logful.git
- npm install --dev
- npm run bench

## API documentation

You can generate the API docs using [Grunt](http://gruntjs.com):

- git checkout https://github.com/Dreamscapes/Logful.git
- npm install --dev
- [sudo] npm install -g grunt-cli
- grunt docs

Documentation is now available at *docs/index.html*.

## License

This software is licensed under the **BSD-3-Clause License**. See the [LICENSE](LICENSE) file for more information.

[npm-badge]: https://badge.fury.io/js/logful.svg
[npm-url]: https://npmjs.org/package/logful
[travis-badge]: https://travis-ci.org/Dreamscapes/Logful.svg
[travis-url]: http://travis-ci.org/Dreamscapes/Logful
[coveralls-badge]: https://coveralls.io/repos/Dreamscapes/Logful/badge.png?branch=develop
[coveralls-url]: https://coveralls.io/r/Dreamscapes/Logful
[grunt-badge]: https://cdn.gruntjs.com/builtwith.png
[grunt-url]: http://gruntjs.com
