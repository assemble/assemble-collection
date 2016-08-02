'use strict';

require('mocha');
var assert = require('assert');
var assemble = require('assemble');

var collection = require('./');
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
    it('should use default `list` and `item` templates when `list` and `item` are undefined', function(cb) {
      app.page('one.hbs', {content: '', data: {tags: ['foo', 'bar']}});

      var files = [];
      app.toStream('pages')
        .pipe(app.createIndex('tags'))
        .on('data', function(file) {
          files.push(file);
        })
        .once('error', cb)
        .on('end', function() {
          assert.equal(files.length, 4);
          assert.equal(files[0].relative, 'one.hbs');
          assert.equal(files[1].relative, 'tags.hbs');
          assert.equal(files[2].relative, 'tags/foo.hbs');
          assert.equal(files[3].relative, 'tags/bar.hbs');
          cb();
        });
    });

    it('should not create new files when source files are not in the collection', function(cb) {
      app.page('one.hbs', {content: ''});

      var files = [];
      app.toStream('pages')
        .pipe(app.createIndex('tags'))
        .on('data', function(file) {
          files.push(file);
        })
        .once('error', cb)
        .on('end', function() {
          assert.equal(files.length, 1);
          assert.equal(files[0].path, 'one.hbs');
          cb();
        });
    });

    it('should create new files when source files are the collection', function(cb) {
      app.page('one.hbs', {content: '', data: {tags: ['foo']}});

      var files = [];
      app.toStream('pages')
        .pipe(app.createIndex({
          pattern: ':tags/:tag.hbs',
          list: app.view({path: 'list.hbs', contents: new Buffer('list')}),
          item: app.view({path: 'item.hbs', contents: new Buffer('item')})
        }))
        .on('data', function(file) {
          files.push(file);
        })
        .once('error', cb)
        .on('end', function() {
          assert.equal(files.length, 3);
          assert.equal(files[0].relative, 'one.hbs');
          assert.equal(files[1].relative, 'tags.hbs');
          assert.equal(files[2].relative, 'tags/foo.hbs');
          cb();
        });
    });

    it('should add the collection to the `app.cache.data.collection`', function(cb) {
      app.page('one.hbs', {content: '', data: {tags: ['foo']}});

      var files = [];
      app.toStream('pages')
        .pipe(app.createIndex('tags'))
        .on('data', function(file) {
          assert.deepEqual(Object.keys(app.cache.data.collection.tags), ['foo']);
          assert.equal(app.cache.data.collection.tags.foo[0].relative, 'one.hbs');
          files.push(file);
        })
        .once('error', cb)
        .on('end', function() {
          assert.equal(files.length, 3);
          assert.equal(files[0].relative, 'one.hbs');
          cb();
        });
    });

    it('should create new files with the correct source files', function(cb) {
      app.page('one.hbs', {contents: new Buffer('one'), data: {tags: ['foo', 'bar']}});
      app.page('two.hbs', {contents: new Buffer('two'), data: {tags: ['bar', 'baz']}});
      app.page('three.hbs', {contents: new Buffer('three'), data: {tags: ['foo', 'baz']}});

      var fixtures = {
        'tags.hbs': {
          tags: {
            foo: ['one.hbs', 'three.hbs'],
            bar: ['one.hbs', 'two.hbs'],
            baz: ['two.hbs', 'three.hbs']
          }
        },
        'tags/foo.hbs': {
          tag: 'foo',
          items: ['one.hbs', 'three.hbs']
        },
        'tags/bar.hbs': {
          tag: 'bar',
          items: ['one.hbs', 'two.hbs']
        },
        'tags/baz.hbs': {
          tag: 'baz',
          items: ['two.hbs', 'three.hbs']
        }
      };

      var files = [];
      app.toStream('pages')
        .pipe(app.createIndex('tags'))
        .on('data', function(file) {
          files.push(file);
        })
        .once('error', cb)
        .on('end', function() {
          assert.equal(files.length, 7);
          assert.equal(files[0].relative, 'one.hbs');
          assert.equal(files[1].relative, 'two.hbs');
          assert.equal(files[2].relative, 'three.hbs');

          files.forEach(function(file) {
            var expected = fixtures[file.relative];
            if (!expected) return;
            if (expected.tags) {
              var tags = Object.keys(file.data.tags);
              var actual = tags.reduce(function(acc, key) {
                acc[key] = file.data.tags[key].map(function(item) { return item.relative; });
                return acc;
              }, {});
              assert.deepEqual(actual, expected.tags);
            } else {
              var actual = file.data.items.map(function(item) { return item.relative; });
              assert.equal(file.data.tag, expected.tag);
              assert.deepEqual(actual, expected.items);
            }
          })
          cb();
        });
    });
  });
});
