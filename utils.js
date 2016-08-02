'use strict';

var utils = require('lazy-cache')(require);
var fn = require;
require = utils;

/**
 * Lazily required module dependencies
 */

require('extend-shallow', 'extend');
require('gulp-collection', 'collection');
require('src-stream', 'src');
require = fn;

/**
 * Expose `utils` modules
 */

module.exports = utils;
