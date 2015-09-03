var exists = require('101/exists');
var isFunction = require('101/is-function');
var isObject = require('101/is-object');
var noop = require('101/noop');
var extend = require('extend');
var Url = require('url');
var qs = require('querystring');
var noop = require('101/noop');

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
    if (!cb) {
      throw new Error('streams aren\'t supported yet');
    }

    opts.method = method.toUpperCase();
    args = [opts, cb].filter(exists);
    var req = createReq(this.app, opts);
    var res = createRes(this.app, opts, cb);
    if (!req.url) {
      throw new Error('url is required');
    }
    var self = this;
    process.nextTick(function () {
      self.app.handle(req, res, noop); // no final 404?
    });
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
  var req = opts.req || {
    __proto__: require('express/lib/request'),
    app: app
  };

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
  if (!opts.req) {
    req.socket = { destroy: noop };
  }

  return req;
}

function createRes (app, opts, cb) {
  var res = {
    __proto__: opts.res || require('express/lib/response'),
    app: app
  };
  // there will always be a cb, until streams are supported
  // if (cb) {
  var sent = false;
  res.write = throwNotSupported('write');
  res.code = throwNotSupported('code');
  res.end = function () {
    if (sent === true) {
      throw new Error('ExpressRequest: Can\'t set headers after they are sent.');
    }
    setupDomain(end);
    // sent=true should be the last line if error w/in res.end (above code)
    function end () {
      sent = true;
      // next tick it to avoid express catching runtime error in the callback
      //   getting caught by express and triggering app's error handler
      process.nextTick(function () {
        res.emit('finish');
        cb(null, res);
      });
    }
  };
  var lastDomain = process.domain; // cache domain
  res.json = res.send = function (statusCode, body) {
    if (sent === true) {
      throw new Error('ExpressRequest: Can\'t set headers after they are sent.');
    }
    if (typeof statusCode === 'number') {
      res.statusCode = statusCode;
    }
    else {
      body = statusCode;
    }
    body = JSON.parse(JSON.stringify(body));
    res.body = body;
    setupDomain(send);
    // sent=true should be the last line if error w/in res.send (above code)
    function send () {
      sent = true;
      // next tick it to avoid express catching runtime error in the callback
      //   getting caught by express and triggering app's error handler
      process.nextTick(function () {
        res.emit('finish');
        cb(null, res, body);
      });
    }
  };

  function setupDomain (cb) {
    if (process.domain && lastDomain !== process.domain) {
      process.domain.exit();
    }
    if (lastDomain) {
      lastDomain.run(cb);
    }
    else {
      cb();
    }
  }

  return res;
}

function throwNotSupported (methodName) {
  return function () {
    throw new Error('express request does not support "res.'+methodName+'" yet..');
  };
}
