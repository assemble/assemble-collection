'use strict';

var utils = require('lazy-cache')(require);
var fn = require;
require = utils;

/**
 * Lazily required module dependencies
 */

require('extend-shallow', 'extend');
require('gulp-collection', 'collection');
require('is-valid-app', 'isValid');
require('stream-combiner', 'combine');
require('through2', 'through');
require = fn;

/**
 * Additional utils
 */

utils.buffer = function() {
  var files = [];
  return utils.through.obj(function(file, enc, cb) {
    files.push(file);
    cb();
  }, function(cb) {
    var stream = this;
    files.forEach(function(file) {
      stream.push(file);
    });
    cb();
  });
};

utils.listTemplate = function(plural, single) {
  return [
    `<h1>${plural}</h1>`,
    `{{#each ${plural} as |items ${single}|}}`,
    `  <h2>{{${single}}}</h2>`,
    `  <ul>`,
    `    {{#each items as |item|}}`,
    `      <li>{{item.data.title}}: {{item.relative}}</li>`,
    `    {{/each}}`,
    `  </ul>`,
    `{{/each}}`
  ].join('\n');
};

utils.itemTemplate = function(prop) {
  return [
    `<h1>${prop}: {{${prop}}}</h1>`,
    `<ul>`,
    `  {{#each items as |item|}}`,
    `    <li>{{item.data.title}}: {{item.relative}}</li>`,
    `  {{/each}}`,
    `</ul>`,
  ].join('\n');
};

/**
 * Expose `utils` modules
 */

module.exports = utils;
