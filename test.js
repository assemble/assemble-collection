'use strict';

require('mocha');
var assert = require('assert');
var collection = require('./');
var assemble = require('assemble');
var app;

describe('assemble-collection', function() {
  beforeEach(function() {
    app = new assemble();
    app.use(collection());
  });

  describe('plugin', function() {
    it('should export a function', function() {
      assert.equal(typeof collection, 'function');
    });

    it('should expose a `createIndex`. method', function() {
      assert.equal(typeof app.createIndex, 'function');
    });
  });

  describe('.createIndex', function() {
    it.skip('should create an collection pattern', function() {
      assert.equal(app.collection('foo'), 'foo');
    });
  });
});
