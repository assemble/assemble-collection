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
var dest = path.join.bind(path, __dirname, 'dist');

var app = assemble();
app.use(collection());

app.task('default', ['simple']);

/**
 * Only load partials and pages for the simple example.
 */

app.task('load-simple', function(cb) {
  app.partials('*.hbs', {cwd: path.join(__dirname, 'src/templates/partials')})
  app.pages('*.hbs', {cwd: path.join(__dirname, 'src')});
  cb();
});

/**
 * The simple example uses defaults to create index pages for the `tags` property found on pages' front-matter
 */

app.task('simple', ['load-simple'], function() {
  return app.toStream('pages')
    .pipe(app.createIndex('tags'))
    .pipe(extname())
    .pipe(buffer())
    .pipe(app.renderFile())
    .pipe(app.dest(dest('simple')));
});

/**
 * Load templates for the advanced example.
 * This creates a new views collection called `lists` that contains templates for the `list` and `item` index pages.
 */

app.task('load-advanced', function(cb) {
  app.create('lists');
  app.lists('*.hbs', {cwd: path.join(__dirname, 'src/templates/lists')})
  app.partials('*.hbs', {cwd: path.join(__dirname, 'src/templates/partials')})
  app.pages('*.hbs', {cwd: path.join(__dirname, 'src')});
  cb();
});

/**
 * The advanced example uses a permalink pattern to determine the property to create index pages with and what the `file.path`
 * structure will look like when the `item` index pages are created.
 * This example also passes in custom `list` and `item` index page templates from the `lists` views collection.
 * Pagination is used for the `item` index pages by setting a `limit` on the `paginate` property
 */

app.task('advanced', ['load-advanced'], function() {
  return app.toStream('pages')
    .pipe(app.createIndex({
      pattern: ':tags/:tag/page/:pager.idx/index.hbs',
      list: app.lists.getView('list'),
      item: app.lists.getView('item'),
      paginate: {limit: 3}
    }))
    // rename `.hbs` to `.html`
    .pipe(extname())
    // buffer files before rendering to ensure context has been created
    .pipe(buffer())
    .pipe(app.renderFile())
    // write rendered files to the destination directory
    .pipe(app.dest(dest('advanced')));
});

function buffer() {
  var files = [];
  return through.obj(function(file, enc, next) {
    files.push(file);
    next(null);
  }, function(cb) {
    var stream = this;
    files.forEach(function(file) {
      stream.push(file);
    });
    cb();
  });
}

module.exports = app;
