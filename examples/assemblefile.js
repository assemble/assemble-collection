'use strict';

/**
 * From the `examples` directory run this example with the following command:
 *
 * ```sh
 * $ assemble
 * ```
 */

var assemble = require('assemble');
var through = require('through2');
var extname = require('gulp-extname');
var path = require('path');

var collection = require('..');

var app = assemble();
app.use(collection());

var dest = path.join(__dirname, 'dist/example');
app.create('lists');

app.task('load', function(cb) {
  app.lists('*.hbs', {cwd: path.join(__dirname, 'src/templates/lists')})
  app.partials('*.hbs', {cwd: path.join(__dirname, 'src/templates/partials')})
  app.pages('*.hbs', {cwd: path.join(__dirname, 'src')});
  cb();
});

app.task('default', ['load'], function() {
  return app.createIndex('pages', {
      File: app.View,
      pattern: ':tags/:tag/page/:pager.idx/index.hbs',
      list: app.lists.getView('list'),
      item: app.lists.getView('item'),
      paginate: 3,
      groupFn: function(group) {
        app.data({site: {tags: group}})
      }
    })
    // rename `.hbs` to `.html`
    .pipe(extname())
    // buffer files before rendering to ensure context has been created
    .pipe(buffer())
    .pipe(app.renderFile())
    // write rendered files to the destination directory
    .pipe(app.dest(function(file) {
      console.log(file.cwd);
      console.log(file.base);
      console.log(file.path);
      console.log(file.relative);
      console.log();
      return dest;
    }))
});

function buffer() {
  var files = [];
  return through.obj(function(file, enc, next) {
    files.push(file);
    next(null);
  }, function(cb) {
    var stream = this;
    files.forEach(function(file) {
      // console.log(file);
      stream.push(file);
    });
    cb();
  });
}

module.exports = app;
