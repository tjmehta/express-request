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

describe('express request arguments', function() {
  var app;
  beforeEach(function (done) {
    app = createAppWithMiddleware(
      mw.res.send('hey')
    );
    done();
  });
  it('should error if url is missing', function (done) {
    var request = new ExpressRequest(app);

      try {
        request.get(function () {});
        done(new Error('this should error'));
      }
      catch (err) {
        expect(err).to.be.ok;
        expect(err.message).to.be.match(/url/);
        expect(err.message).to.be.match(/require/);
        done();
      }
  });
  it('should work with url, opts, and cb', function (done) {
    var request = new ExpressRequest(app);

    request.get('/hey', {}, done);
  });
  it('should work with url and cb', function (done) {
    var request = new ExpressRequest(app);

    request.get('/hey', done);
  });
  it('should work with opts (with url) and cb', function (done) {
    var request = new ExpressRequest(app);

    request.get({ url: '/hey' }, done);
  });
  it('should work with url, and cb', function (done) {
    var request = new ExpressRequest(app);

    request.get('/hey', done);
  });
  describe('opts', function() {
    it('opts.req override req', function (done) {
      var request = new ExpressRequest(app);

      var req = { __proto__: require('express/lib/request'), app: app };
      request.get('/hey', { req: req }, done);
    });
    it('opts.res override res (no cb)', function (done) {
      var request = new ExpressRequest(app);

      var res = { __proto__: require('express/lib/response'), app: app };
      try {
        request.get('/hey', { res: res });
      } catch (e) {
        expect(e.message).to.match(/streams/);
        done();
      }
    });
    it('opts.res override res (w/ cb)', function (done) {
      var request = new ExpressRequest(app);

      var res = { __proto__: require('express/lib/response'), app: app };
      request.get('/hey', { res: res }, done);
    });
  });
  describe('res.send called twice', function() {
    var app;
    beforeEach(function (done) {
      app = createAppWithMiddleware(
        function (req, res, next) {
          res.send(201, 'tejesh');
          next();
        },
        mw.res.send('hey')
      );
      done();
    });
    it('should not error if res.send calledd twice', function (done) {
      var request = new ExpressRequest(app);

      request.get('/hey', done);
    });
  });
});
