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

app.task('load-simple', function(cb) {
  app.partials('*.hbs', {cwd: path.join(__dirname, 'src/templates/partials')})
  app.pages('*.hbs', {cwd: path.join(__dirname, 'src')});
  cb();
});

app.task('simple', ['load-simple'], function() {
  return app.toStream('pages')
    .pipe(app.createIndex('tags'))
    .pipe(extname())
    .pipe(app.renderFile())
    .pipe(app.dest(dest('simple')));
});

app.task('load-advanced', function(cb) {
  app.create('lists');
  app.lists('*.hbs', {cwd: path.join(__dirname, 'src/templates/lists')})
  app.partials('*.hbs', {cwd: path.join(__dirname, 'src/templates/partials')})
  app.pages('*.hbs', {cwd: path.join(__dirname, 'src')});
  cb();
});

app.task('advanced', ['load-advanced'], function() {
  return app.toStream('pages')
    .pipe(app.createIndex({
      pattern: ':tags/:tag/page/:pager.idx/index.hbs',
      list: app.lists.getView('list'),
      item: app.lists.getView('item'),
      paginate: 3
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
      // console.log(file);
      stream.push(file);
    });
    cb();
  });
}

module.exports = app;
