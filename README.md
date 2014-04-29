nice-cache
=============

A nice in-memory cache for node.js. In addiction of the classic auto-flush mechanism, it comes with an auto-refresh mechanism.

Node version: **0.8.0** required

Build status: [![Build Status](https://secure.travis-ci.org/opentable/nice-cache.png?branch=master)](http://travis-ci.org/opentable/nice-cache)

[![NPM](https://nodei.co/npm/nice-cache.png?downloads=true)](https://npmjs.org/package/nice-cache)

# Installation

```shell
npm install nice-cache
```

# Usage

A simple usage with a web-server that consumes an API or reads from a DB:

* Try getting a value from the cache
* When a key is not found:
   * you set the value
   * then you subscribe a delegate function to the refresh loop, that will happen every 60 seconds.

```js
var Cache = require('nice-cache'),
    http = require('http');

var cache = new Cache({ refreshInterval: 60 });

http.createServer(function (req, res) {

  var getUsers = function(callback){
    // do something asynchronous...
    callback(err, result);
  };

  var users = cache.get('api-responses', 'users');

  if(!!users)
    return res.end(users);

  getUsers(function(err, result){
    cache.set('api-responses', 'users', result);
    cache.sub('api-responses', 'users', getUsers);
    res.end(result);
  });

}).listen(1337, '127.0.0.1');
```

# API

### new Cache([options])

Gets the current instance of the cache (eventually after creating it).

The optional `options` parameter can consist on one of more of the following properties:
* `singleton`, bool, default `true`, when false returns a new instance after any initialisation.
* `refreshInterval`, int, default `0`, sets the refresh interval for the subscribed functions (seconds). When 0 it does nothing.
* `flushInterval`, int, default `0`, sets the flush interval for all the keys. When 0 it never flushes and so values never expire.
* `verbose`, bool, default `false`, writes stuff on the console for debugging purposes.

### Cache#set([type, ] key, value)

Sets a value. Type is optional.

### Cache#get([type, ] key)

Gets a value. Type is optional. Returns `undefined` when a key is not found.

### Cache#flush()

Cleans the cache

### Cache#sub([type, ] key, func)

Subscribes the key-value assignment (paired with an optional type) to the refresh loop. The asynchronous function will need to have an (err, res) callback.

# Tests

```shell
npm test
```

# License

MIT

# Contributors

* [@matteofigus](https://github.com/matteofigus)
