'use strict';

var utils = require('./utils');
var cu = require('gulp-collection/lib/utils');

module.exports = function(config) {
  return function(app) {
    if (!utils.isValid(app, 'assemble-collection')) {
      return;
    }

    /**
     * Creates a pipeline plugin that will group files into a collection based on the data property specified directly or
     * in the permalink pattern passed on `options`.
     *
     * List and item index pages will also be created for the entire list of items being grouped and for each individual item.
     * The item pages will contain all of the files found in that item group.
     *
     * Custom list and item page templates may be specified by passing a `view` on `options.list` and `options.item`.
     * The item pages may be paginated by passing an `options.paginate` property with [paginationator][] options.
     *
     * ```js
     * app.task('build', function() {
     *   return app.toStream('pages')
     *     .pipe(app.createIndex('tags'))
     *     .pipe(app.dest('dist'));
     * });
     * ```
     *
     * @name createIndex
     * @param {String} `prop` Proprty to use when creating the index. This should be on the `.data` object. The `prop` will be pulled from the permalink pattern if not passed and `options.pattern` is passed.
     * @param {Object} `options` Options to control how list and item pages are created, how pagination is handled, and how the `file.path` is created on new files.
     * @param {String} `options.pattern` Permalink pattern to use for item pages. When `prop` is not passed, the first `:prop` segment will be used.
     * @param {Object} `options.paginate` Options to pass to [paginationator][] to control how item page pagination is handled.
     * @param {Object} `options.list` View instance used to create a new `list` page containing the grouped items and files built from the `prop`.
     * @param {Object} `options.item` View instance used to create new `item` pages for each item in the grouped list. Each item page contains the files containing the specific `prop`.
     * @api public
     */

    app.define('createIndex', function(prop, options) {
      if (typeof prop !== 'string') {
        options = prop;
        prop = null;
      }
      var opts = utils.extend({}, config, options);
      var pattern = opts.pattern || '';

      prop = prop || opts.prop || cu.getProp(pattern);
      var single = cu.single(prop || '');

      opts.groupFn = function(group) {
        app.data(`collection.${prop}`, group);
      };

      if (!pattern) {
        pattern = `:${prop}/:${single}.hbs`;
      }

      if (typeof opts.list === 'undefined') {
        opts.list = app.view('list.hbs', {content: utils.listTemplate(prop, single)});
      }

      if (typeof opts.item === 'undefined') {
        opts.item = app.view('item.hbs', {content: utils.itemTemplate(single)});
      }

      return utils.combine(
        utils.collection(pattern, opts),
        utils.buffer()
      );
    });
  };
};
