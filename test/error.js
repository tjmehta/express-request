var domain = require('domain');
var Lab = require('lab');
var Code = require('code');
var lab = exports.lab = Lab.script();

var expect = Code.expect;
var describe = lab.experiment;
var it = lab.test;
var before = lab.before;
var beforeEach = lab.beforeEach;
var express = require('express');
var mw = require('dat-middleware');
var createAppWithMiddleware = require('./fixtures/createAppWithMiddlewares');
var ExpressRequest = require('../index');
var errors = function (appErr) {
  return {
    next: mw.next(appErr),
    throw: function (req, res, next) {
      throw appErr;
    },
    async: function (req, res, next) {
      setTimeout(function () {
        throw appErr;
      }, 0);
    }
  };
};

describe('request error', function() {
  var app;

  describe('next error', function() {
    var appErr;
    beforeEach(function (done) {
      appErr = new Error('boom');
      app = createAppWithMiddleware(
        errors(appErr).next,
        errorHandler
      );
      done();
    });

    it('should respond the error', function (done) {
      var request = new ExpressRequest(app);
      request.get('/hey', function (err, res, body) {
        if (err) { return done(err); }
        expect(res.statusCode).to.equal(555);
        expect(body).to.deep.equal({ message: appErr.message });
        done();
      });
    });
  });

  describe('throw error', function() {
    var appErr;
    beforeEach(function (done) {
      appErr = new Error('boom');
      app = createAppWithMiddleware(
        errors(appErr).throw,
        errorHandler
      );
      done();
    });

    it('should respond the error', function (done) {
      var request = new ExpressRequest(app);
      request.get('/hey', function (err, res, body) {
        if (err) { return done(err); }
        expect(res.statusCode).to.equal(555);
        expect(body).to.deep.equal({ message: appErr.message });
        done();
      });
    });
  });

  describe('domain error', function() {
    var appErr;
    beforeEach(function (done) {
      appErr = new Error('boom');
      app = createAppWithMiddleware(
        setupDomain,
        errors(appErr).async,
        errorHandler
      );
      done();
    });

    it('should respond the error', function (done) {
      var request = new ExpressRequest(app);
      request.get('/hey', function (err, res, body) {
        if (err) { return done(err); }
        expect(res.statusCode).to.equal(555);
        expect(body).to.deep.equal({ message: appErr.message });
        done();
      });
    });
  });

  describe('internal request', function() {
    var nextErr = new Error('next');
    var throwErr = new Error('throw');
    var asyncErr = new Error('async');
    var errInExpressReqCb = new Error('callback');
    var port = 3032;
    before(function (done) {
      var routes = express();
      routes.get('/internal-request', function (req, res, next) {
        var request = new ExpressRequest(app);
        request.get(req.query.route, { qs: req.query }, function (err, res, body) {
          req.statusCode = res.statusCode;
          req.body = body;
          next(err);
        });
      });
      routes.get('/internal-request-w-err', function (req, res, next) {
        var request = new ExpressRequest(app);
        request.get(req.query.route, function (err, res, body) {
          console.log(body);
          throw errInExpressReqCb;
        });
      });
      routes.get('/',  mw.res.json(200, { message: 'hello' }));
      app = createAppWithMiddleware(
        setupDomain,
        routes,
        mw.res.json('statusCode', 'body'),
        errorHandler
      );
      app.listen(port, done);
    });

    describe('bubble', function() {

      it('should work w/out domains', function(done) {
        var http = require('request');
        var opts = {
          qs: { route: '/', noDomain: true },
          json: true
        };
        var url = 'http://localhost:'+port+'/internal-request';
        var errInCallback = new Error('callback');
        http.get(url, opts, function (err, res, body) {
          if (err) { return done(err); }
          expect(res.statusCode).to.equal(200);
          expect(body).to.deep.equal({ message: 'hello' });
          done();
        });
      });
    });

    describe('callback error', function() {

      it('should bubble the error to the correct domain', function(done) {
        var http = require('request');
        var opts = {
          qs: { route: '/' },
          json: true
        };
        var url = 'http://localhost:'+port+'/internal-request-w-err';
        var errInCallback = new Error('callback');
        http.get(url, opts, function (err, res, body) {
          if (err) { return done(err); }
          expect(res.statusCode).to.equal(555);
          expect(body).to.deep.equal({ message: errInExpressReqCb.message });
          done();
        });
      });
    });
  });
});

var id = 0;
function setupDomain (req, res, next) {
  if (req.query.noDomain) {
    if (process.domain) {
      // exit test runner domain...
      process.domain.exit();
    }
    return next();
  }
  var d = domain.create();
  req.domain = d;
  d.add(req);
  d.add(res);
  d.on('error', function (err) {
    errorHandler(err, req, res, next);
  });
  d.run(next);
}
function errorHandler (err, req, res, next) {
  res.json(555, { message: err.message });
}
