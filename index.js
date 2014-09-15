var exists = require('101/exists');
var isFunction = require('101/is-function');
var isObject = require('101/is-object');
var extend = require('extend');
var Url = require('url');
var qs = require('querystring');

module.exports = ExpressRequest;

function ExpressRequest (app) {
  var self = this;
  var appWrap = require('express')();
  appWrap.use(app);
  this.app = appWrap;
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
    if (!exists(cb)) {
      throw new Error('streams not supported yet');
    }

    opts.method = method.toUpperCase();
    args = [opts, cb].filter(exists);
    var req = createReq(this.app, opts);
    var res = createRes(this.app, opts, cb);
    if (!req.url) {
      throw new Error('url is required');
    }

    this.app.handle(req, res); // no final 404?
    return res;
  }
});

ExpressRequest.prototype.defaults = function (defaults) {
  this.defaultOpts = defaults;
  if (defaults.req) {
    // app.request gets overrides the prototype of the req created below (express)
    var origReq = this.app.request;
    var req = this.app.request = defaults.req;
    console.log(defaults.req);
    console.log(this.app.request.foo);
    console.log(this.app.request.foo);
    console.log(this.app.request.foo);
    req.__proto__ = origReq;
  }
  if (defaults.res) {
    // app.request gets overrides the prototype of the res created below (express)
    var origRes = this.app.response;
    var res = this.app.response = defaults.res;
    res.__proto__ = origRes;
  }
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

  opts = opts || {};
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
  var req = { __proto__: require('express/lib/request'), app: app };
  console.log('HEY', app.request.foo);
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
  req.query = JSON.parse(JSON.stringify(req.query || {}));
  req.query = qs.parse(qs.stringify(req.query));
  req.body = JSON.parse(JSON.stringify(req.body || {}));
  req.connection = req.connection || {};
  req.connection.remoteAddress = '127.0.0.1';

  return req;
}

function createRes (app, opts, cb) {
  var res = { __proto__: require('express/lib/response'), app: app };

  if (opts.res) {
    res.send = (opts.res.send === res.send) ?
      send : opts.res.send;
    res.json = (opts.res.json === res.json) ?
      send : opts.res.json;
  }
  else {
    res.send = send;
    res.json = send;
  }
  console.log(res.send);
  console.log(res.json);

  var sent = false;
  function send (statusCode, body) {
    if (sent === true) return;
    sent = true;
    if (typeof statusCode === 'number') {
      res.statusCode = statusCode;
    }
    else {
      body = statusCode;
    }
    res.body = body;

    process.nextTick(function () { // so express doesnt catch errors
      cb(null, res, body);
    });
  }

  return res;
}

function exists (v) {
  return v !== undefined && v !== null;
}