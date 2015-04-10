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

describe('unsupported functionality', function() {
  var app;
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
  });
});
