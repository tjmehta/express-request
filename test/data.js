var Lab = require('lab');
var Code = require('code');
var lab = exports.lab = Lab.script();

var expect = Code.expect;
var describe = lab.experiment;
var it = lab.test;
var beforeEach = lab.beforeEach;
var mw = require('dat-middleware');
var createAppWithMiddleware = require('./fixtures/createAppWithMiddlewares');
var ExpressRequest = require('../index');

describe('request data', function() {
  var app;
  describe('data', function() {
    describe('query', function() {
      beforeEach(function (done) {
        app = createAppWithMiddleware(
          mw.res.send('query')
        );
        done();
      });
      it('opts.qs send query', function (done) {
        var request = new ExpressRequest(app);

        var res = { __proto__: require('express/lib/response'), app: app };
        var query = { foo: 1 };
        request.get('/hey', { qs: query }, function (err, res, body) {
          if (err) { return done(err); }
          expect(body).to.deep.equal(body);
          done();
        });
      });
      it('opts.query send query', function (done) {
        var request = new ExpressRequest(app);

        var res = { __proto__: require('express/lib/response'), app: app };
        var query = { foo: 1 };
        request.get('/hey', { query: query }, function (err, res, body) {
          if (err) { return done(err); }
          expect(body).to.deep.equal(body);
          done();
        });
      });
    });

    describe('body', function() {
      beforeEach(function (done) {
        app = createAppWithMiddleware(
          mw.res.send('body')
        );
        done();
      });
      it('opts.json send body', function (done) {
        var request = new ExpressRequest(app);

        var res = { __proto__: require('express/lib/response'), app: app };
        var body = { foo: 1 };
        request.post('/hey', { json: body }, function (err, res, body) {
          if (err) { return done(err); }
          expect(body).to.deep.equal(body);
          done();
        });
      });
      it('opts.body send body', function (done) {
        var request = new ExpressRequest(app);

        var res = { __proto__: require('express/lib/response'), app: app };
        var body = { foo: 1 };
        request.get('/hey', { body: body }, function (err, res, body) {
          if (err) { return done(err); }
          expect(body).to.deep.equal(body);
          done();
        });
      });
    });

    describe('params', function() {
      beforeEach(function (done) {
        app = createAppWithMiddleware(
          mw.res.send('params')
        );
        done();
      });
      it('opts.body send body', function (done) {
        var request = new ExpressRequest(app);

        var res = { __proto__: require('express/lib/response'), app: app };
        var params = { foo: 1 };
        request.get('/hey', { params: params }, function (err, res, body) {
          if (err) { return done(err); }
          expect(body).to.deep.equal(body);
          done();
        });
      });
    });

    describe('headers', function() {
      beforeEach(function (done) {
        app = createAppWithMiddleware(
          mw.res.send('headers')
        );
        done();
      });
      it('opts.body send body', function (done) {
        var request = new ExpressRequest(app);

        var res = { __proto__: require('express/lib/response'), app: app };
        var headers = { foo: 1 };
        request.defaults({ headers: headers });
        request.get('/hey', function (err, res, body) {
          if (err) { return done(err); }
          expect(body).to.deep.equal(body);
          done();
        });
      });
    });
  });
});
