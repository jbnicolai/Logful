# Logful

[![NPM Version][npm-badge]][npm-url]
[![Build Status][travis-badge]][travis-url]
[![Coverage Status][coveralls-badge]][coveralls-url]

> Logging everywhere, made simple and still configurable

## About

Logful is a logging module. It can write your log messages to multiple destinations at once. It provides you with a client whose methods are named in accordance with the [Syslog's severity levels][wiki-syslog-levels] specification.

The following logging **handlers** are currently supported:

- `console` - send messages to the console (STDERR), and with colours!
- `file` - log messages to a log file
- `syslog` - send messages to Syslog

... and you can easily implement your own if needed.

## Installation Instructions

Install the module via **npm**: `npm install logful [--save]`

Unless you plan on removing your logging statements make sure you install the module as production dependency.

## Usage

The most powerful feature of Logful is the possibility to use multiple logging destinations at the same time:

```js
// Load the module's main "class"
var Logful = require('logful')

// This needs to be done only once - tell Logful where to write
// your log messages
Logful
  // Name your app - some handlers may use this information to
  // distinguish your app's entries from others (i.e. Syslog does this)
  .application('MyApp')
  .use('console')
  .use('syslog')

// somewhere where you actually need to log something...

// Each instance accepts an optional 'name' argument that further helps
// identifying from where the message is coming
var logger = new Logful('my-module')
logger.info('this will be logged to console and Syslog!')
```

All logging methods also accept `Error` objects as input - the `err.message` will then be logged. Also, you may use `printf`-like syntax:

```js
var str = 'test string'
logger.info('Value of str: %s', str) // -> Value of str: test string

logger.info(new Error('Just FYI, Something bad happened'))
```

### Available logging methods

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

#### Note for Mac OS X users

The native Console app by default shows only messages with severity level of `warn` and above.

## API Documentation

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

By default, messages are ignored if you do not specify a destination

```js
Logful.use('file', { path: './logfile' })
```

### new Logful()

Create a new instance and start logging! Optionally, you can provide a module name to this instance so that each of you modules' entries will be easily recognisable.

```js
var logger = new Logful('MyModule')
```

## Customising Logful

To be documented. For now, please take a look at `GenericHandler`'s constructor.

## Performance

All the built-in handlers are implemented using Streams, so sending a message to all available log handlers will not slow your code execution. If you wish to see how fast you can go, run the included benchmarks:

- git checkout https://github.com/Dreamscapes/Logful.git
- npm install --dev
- npm run bench

## Generating detailed API documentation

You can generate the API docs using [Grunt][grunt-url]:

```sh
git checkout https://github.com/Dreamscapes/Logful.git
npm install --dev
[sudo] npm install -g grunt-cli
grunt docs
```

Documentation is now available at *docs/index.html*.

## License

This software is licensed under the **BSD-3-Clause License**. See the [LICENSE](LICENSE) file for more information.

[npm-badge]: https://badge.fury.io/js/logful.svg
[npm-url]: https://npmjs.org/package/logful
[travis-badge]: https://travis-ci.org/Dreamscapes/Logful.svg
[travis-url]: http://travis-ci.org/Dreamscapes/Logful
[coveralls-badge]: https://coveralls.io/repos/Dreamscapes/Logful/badge.png?branch=develop
[coveralls-url]: https://coveralls.io/r/Dreamscapes/Logful
[wiki-syslog-levels]: http://www.wikipedia.org/wiki/Syslog#Severity_levels
