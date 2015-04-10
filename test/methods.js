var Lab = require('lab');
var Code = require('code');
var lab = exports.lab = Lab.script();

var expect = Code.expect;
var describe = lab.experiment;
var it = lab.test;
var before = lab.before;
var after = lab.after;
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
        expect(res.body).to.equal(body)
        expect(res.body).to.equal('hey');
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
        expect(res.body).to.deep.equal(body);
        expect(res.body).to.deep.equal(resJSON);
        done();
      });
    });
  });
});
