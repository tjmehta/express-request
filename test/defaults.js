var Lab = require('lab');

var describe = Lab.experiment;
var it = Lab.test;
var expect = Lab.expect;
var beforeEach = Lab.beforeEach;
var mw = require('dat-middleware');
var createAppWithMiddleware = require('./fixtures/createAppWithMiddlewares');
var ExpressRequest = require('../index');

describe('defaults', function() {
  var app;
  describe('data', function() {
    beforeEach(function (done) {
      app = createAppWithMiddleware(
        function (req, res, next) {
          req.__proto__ = req.app.request;
          res.__proto__ = req.app.response;
          req.foo++;
          req.body.foo = req.foo;
          next();
        },
        mw.res.send('body')
      );
      done();
    });
    it('should not share req between requests', function (done) {
      var request = new ExpressRequest(app);
      request.defaults({ req: { foo:1 } });

      var json = { bar: 1 };
      request.post('/hey', { json: json }, function (err, res, body) {
        if (err) { return done(err); }
        expect(body).to.eql({ foo: 2, bar: 1 });
        request.post('/what', { json: json }, function (err, res, body) {
          if (err) { return done(err); }
          expect(body).to.eql({ foo: 2, bar: 1 });
          done();
        });
      });
    });
  });
});