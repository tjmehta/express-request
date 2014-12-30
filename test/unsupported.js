var Lab = require('lab');

var describe = Lab.experiment;
var it = Lab.test;
var expect = Lab.expect;
var beforeEach = Lab.beforeEach;
var mw = require('dat-middleware');
var createAppWithMiddleware = require('./fixtures/createAppWithMiddlewares');
var ExpressRequest = require('../index');

describe('unsupported functionality', function() {
  describe('res', function() {
    describe('write', function() {
      beforeEach(function (done) {
        app = createAppWithMiddleware(
          mw.res.write('hello')
        );
        done();
      });
      it('should error', function (done) {
        var request = new ExpressRequest(app);
        var query = { foo: 1 };
        request.get('/hey', { qs: query }, function (err, res, body) {
          expect(res).to.be.ok;
          expect(res.statusCode).to.equal(500);
          expect(res.body).to.match(/res.write/);
          done();
        });
      });
    });
    describe('code', function() {
      beforeEach(function (done) {
        app = createAppWithMiddleware(
          function (req, res, next) {
            res.code(100);
          }
        );
        done();
      });
      it('should error', function (done) {
        var request = new ExpressRequest(app);
        var query = { foo: 1 };
        request.get('/hey', { qs: query }, function (err, res, body) {
          expect(res).to.be.ok;
          expect(res.statusCode).to.equal(500);
          expect(res.body).to.match(/res.code/);
          done();
        });
      });
    });
    describe('end', function() {
      beforeEach(function (done) {
        app = createAppWithMiddleware(
          mw.res.end('hello')
        );
        done();
      });
      it('should error', function (done) {
        var request = new ExpressRequest(app);
        var query = { foo: 1 };
        request.get('/hey', { req:{connection:{}} }, function (err, res, body) {
          expect(res).to.be.ok;
          expect(res.statusCode).to.equal(500);
          expect(res.body).to.match(/res.end/);
          done();
        });
      });
    });
  });
});