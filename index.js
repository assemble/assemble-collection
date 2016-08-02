'use strict';

var utils = require('./utils');
var cu = require('gulp-collection/lib/utils');

module.exports = function(config) {
  return function(app) {
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
