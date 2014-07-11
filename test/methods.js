var Lab = require('lab');

var describe = Lab.experiment;
var it = Lab.test;
var expect = Lab.expect;
var before = Lab.before;
var after = Lab.after;
var mw = require('dat-middleware');
var createAppWithMiddleware = require('./fixtures/createAppWithMiddlewares');
var Request = require('../index');

var methods = ['get', 'post', 'put', 'patch', 'delete'];
describe('methods', function() {
  methods.forEach(function (method) {
    it('should execute the method and run the middlewares', function (done) {
      var app = createAppWithMiddleware(
        mw.res.send('hey')
      );
      var request = new Request(app);

        request[method]('/hey', function (err, res, body) {
          if (err) { return done(err); }

          expect(res.statusCode).to.equal(200);
          expect(res.body).to.equal(body).to.equal('hey');
          done();
        });
    });

    it('should execute the method and run the middlewares', function (done) {
      var resJSON = { hey: 1 };
      var app = createAppWithMiddleware(
        mw.res.json(resJSON)
      );
      var request = new Request(app);

        request[method]('/hey', function (err, res, body) {
          if (err) { return done(err); }

          expect(res.statusCode).to.equal(200);
          expect(res.body).to.eql(body).to.eql(resJSON);
          done();
        });
    });
  });
});