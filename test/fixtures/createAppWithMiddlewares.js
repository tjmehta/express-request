var express = require('express');

module.exports = function createAppWithMiddlewares (/* middlewares */) {
  var middlewares = Array.prototype.slice.call(arguments);
  var app = express();
  middlewares.forEach(function (mw) {
    console.log('adding mw');
    app.use(mw);
  });
  app.get('/hey', function (req, res) {
    res.send(404);
  });
  app.all('*', function (req, res) {
    res.send(404);
  });
  app.use(function (err, req, res, next) {
    console.log('ERROR!!', err, err.stack);
    res.send(500, err.message);
  });
  console.log(app._router);
  return app;
};
