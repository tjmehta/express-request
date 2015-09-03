var Lab = require('lab');
var Code = require('code');
var lab = exports.lab = Lab.script();

var expect = Code.expect;
var describe = lab.experiment;
var it = lab.test;
var beforeEach = lab.beforeEach;
var mw = require('dat-middleware');
var noop = require('101/noop');
var createAppWithMiddleware = require('./fixtures/createAppWithMiddlewares');
var ExpressRequest = require('../index');

describe('end', function() {
  var app;
  beforeEach(function (done) {
    app = createAppWithMiddleware(
      mw.res.status(200),
      mw.res.end()
    );
    done();
  });
  it('should respond with statusCode and null body', function (done) {
    var request = new ExpressRequest(app);
    var query = { foo: 1 };
    request.get('/hey', { req:{connection:{}} }, function (err, res, body) {
      expect(res).to.exist();
      expect(res.statusCode).to.equal(200);
      expect(res.body).to.be.undefined();
      expect(body).to.be.undefined();
      done();
    });
  });
  describe('res.end called twice', function() {
    var app;
    beforeEach(function (done) {
      app = createAppWithMiddleware(
        function (req, res, next) {
          res.end();
          next();
        },
        mw.res.end()
      );
      done();
    });
    it('should not error if res.end called twice', function (done) {
      var request = new ExpressRequest(app);

      request.get('/hey', done);
    });
  });
  describe('res.end events', function () {
    var app, onFinish;
    beforeEach(function (done) {
      app = createAppWithMiddleware(
        function (req, res, next) {
          res.on('finish', onFinish);
          next();
        },
        mw.res.end()
      );
      done();
    });
    it('should emit finish', function (done) {
      var request = new ExpressRequest(app);

      onFinish = done;

      request.get('/hey', noop);
    });
  });
});
