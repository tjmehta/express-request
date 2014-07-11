var Lab = require('lab');

var describe = Lab.experiment;
var it = Lab.test;
var expect = Lab.expect;
var beforeEach = Lab.beforeEach;
var mw = require('dat-middleware');
var createAppWithMiddleware = require('./fixtures/createAppWithMiddlewares');
var ExpressRequest = require('../index');

describe('streams', function() {
  var app;
  beforeEach(function (done) {
    app = createAppWithMiddleware(
      mw.res.send('hey')
    );
    done();
  });
  it('should throw an error, bc it isnt supported yet', function (done) {
    var request = new ExpressRequest(app);
    try {
      request.get('/hey', {});
    }
    catch (err) {
      // FIXME: streams are not supported yet
      done();
    }
  });
});