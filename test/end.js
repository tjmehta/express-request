var Lab = require('lab');

var describe = Lab.experiment;
var it = Lab.test;
var expect = Lab.expect;
var beforeEach = Lab.beforeEach;
var mw = require('dat-middleware');
var createAppWithMiddleware = require('./fixtures/createAppWithMiddlewares');
var ExpressRequest = require('../index');

describe('end', function() {
  beforeEach(function (done) {
    app = createAppWithMiddleware(
      mw.res.status(200);
      mw.res.end()
    );
    done();
  });
  it('should respond with statusCode and null body', function (done) {
    var request = new ExpressRequest(app);
    var query = { foo: 1 };
    request.get('/hey', { req:{connection:{}} }, function (err, res, body) {
      expect(res).to.be.ok;
      expect(res.statusCode).to.equal(200);
      expect(res.body).to.equal(undefined);
      expect(body).to.equal(undefined);
      done();
    });
  });
});
