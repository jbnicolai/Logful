# Dreamscapes\logful
#
# Licensed under the BSD-3-Clause license
# For full copyright and license information, please see the LICENSE file
#
# @author		Robert Rossmann <rr.rossmann@me.com>
# @copyright	2014 Robert Rossmann
# @link			https://github.com/Dreamscapes/logful
# @license		http://choosealicense.com/licenses/BSD-3-Clause  BSD-3-Clause License


LIBDIR = lib				# Source js files
TSTDIR = test				# Test cases
DOCDIR = docs				# Generated API documentation
COVDIR = coverage			# Generated code coverage data
BENCHDIR = benchmark		# Benchmark files

BIN = node_modules/.bin/

# Command line args for Mocha test runner
MOCHAFLAGS = --reporter spec --require should

# Default - Run it all! (except for coveralls - that should be run only from Travis)
all: install lint test coverage docs

# Install dependencies (added for compatibility reasons with usual workflows with make,
# i.e. calling make && make install)
install:
	@npm install

# Lint all js files (configuration available in .jshintrc)
lint:
	@$(BIN)jshint $(LIBDIR) $(TSTDIR) $(BENCHDIR) \
		--reporter node_modules/jshint-stylish/stylish.js

# Run tests using Mocha
test:
	@$(BIN)mocha $(MOCHAFLAGS)

# Generate coverage report (html report available in coverage/lcov-report)
coverage:
	@$(BIN)istanbul cover _mocha > /dev/null -- $(MOCHAFLAGS)

# Submit coverage results to Coveralls (works from Travis; from localhost, additional setup is
# necessary
coveralls: coverage
	@cat $(COVDIR)/lcov.info | $(BIN)coveralls

# Generate API documentation
docs:
	@$(BIN)jsdoc -r $(LIBDIR) README.md --destination $(DOCDIR)

# Run benchmarks for logging handlers
bench:
	@$(BIN)matcha

# Delete API docs
clean-docs:
	@rm -rf $(DOCDIR)

# Delete coverage results
clean-coverage:
	@rm -rf $(COVDIR)

# Delete all generated files
clean: clean-docs clean-coverage

.PHONY: install lint test coveralls bench clean-docs clean-coverage clean
