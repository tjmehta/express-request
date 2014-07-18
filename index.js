var exists = require('101/exists');
var isFunction = require('101/is-function');
var isObject = require('101/is-object');
var extend = require('extend');

module.exports = ExpressRequest;

function ExpressRequest (app) {
  this.app = app;
}

var methodAliases = {
  delete: 'del'
};
require('methods').forEach(function (method) {
  if (method in methodAliases) {
    ExpressRequest.prototype[methodAliases[method]] = methodFn;
  }
  ExpressRequest.prototype[method] = methodFn;

  function methodFn (/* url, opts, cb */) {
    var args = Array.prototype.slice.call(arguments);
    args = this._formatArgs(args);
    var opts = args.opts;
    var cb   = args.cb;

    opts.method = method.toUpperCase();
    args = [opts, cb].filter(exists);
    var req = createReq(this.app, opts);
    var res = createRes(this.app, opts, cb, args);
    if (!req.url) {
      throw new Error('url is required');
    }

    this.app.handle(req, res); // no final 404?
    return res;
  }
});

ExpressRequest.prototype.defaults = function (defaults) {
  this.defaultOpts = defaults;
  return this;
};



// private utils
ExpressRequest.prototype._formatArgs = function (args) {
  var url  = args[0];
  var opts = args[1];
  var cb   = args[2];

  if (isFunction(url)) {
    cb = url;
    opts = null;
    url = null;
  }
  else if (isObject(url)) {
    cb = opts;
    opts = url;
    url = null;
  }
  else if (isFunction(opts)) {
    cb = opts;
    opts = null;
  }
  else {}

  opts = extend(opts || {}, this.defaultOpts);
  opts.url = url || opts.url || opts.uri;

  return {
    opts: opts,
    cb: cb
  };
};

var optsToReq = {
  qs: 'query',
  json: 'body'
};
function createReq (app, opts) {
  var req = opts.req || { __proto__: require('express/lib/request'), app: app };

  extend(req, opts);

  Object.keys(optsToReq).forEach(function (optKey) {
    var o = opts;
    if (optKey in o) {
      req[optsToReq[optKey]] = o[optKey];
      delete req[optKey];
    }
  });

  req.headers = req.headers || {};
  req.params = req.params || {};
  req.query = JSON.parse(JSON.stringify(req.qs || {}));
  req.body = JSON.parse(JSON.stringify(req.body || {}));

  return req;
}

function createRes (app, opts, cb) {
  var res = opts.res || { __proto__: require('express/lib/response'), app: app };

  if (cb && !opts.res) {
    var sent = false;
    res.json = res.send = function (statusCode, body) {
      if (sent === true) return;
      sent = true;
      if (typeof statusCode === 'number') {
        res.statusCode = statusCode;
      }
      else {
        body = statusCode;
      }
      res.body = body;
      cb(null, res, body);
    };
  }

  return res;
}