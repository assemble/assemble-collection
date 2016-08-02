'use strict';

var utils = require('./utils');

module.exports = function(config) {
  return function(app) {
    app.define('createIndex', function(name, options) {
      if (typeof name !== 'string') {
        options = name;
        name = null;
      }
      var opts = utils.extend({}, config, options);
      name = name || opts.name;
      var pattern = opts.pattern || '';

      return utils.src(app.toStream(name)
          .pipe(utils.collection(pattern, opts)));
    });
  };
};
