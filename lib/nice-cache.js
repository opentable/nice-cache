var cache = function(options){

  // default options
  options = options || {};
  options.singleton = typeof(options.singleton !== 'undefined') ? options.singleton : true;
  options.flushInterval = options.flushInterval || 0;
  options.refreshInterval = options.refreshInterval || 0;
  options.verbose = options.verbose || false;

  if(cache.initialized && options.singleton)
    return cache;

  this.initialized = true;
  cache = this;

  var self = this,
      subscribed = [],
      noType = "__notype__",
      cachedObjects = {};

  var log = function(msg){
    if(options.verbose)
      console.log(msg);
  };

  log("cache init");

  this.get = function(type, key){
    if(!!type && !key){
      key = type;
      type = noType;
    }

    var cachedObject = cachedObjects[type] || {};
    var value = cachedObject[key];
    return value;
  };

  this.set = function(type, key, value){
    if(!!type && !!key && !value){
      value = key;
      key = type;
      type = noType;
    }

    if(!cachedObjects[type])
      cachedObjects[type] = {};
    var cachedObject = cachedObjects[type];
    cachedObject[key] = value;
  };

  this.sub = function(type, key, func){
    if(!!type && !!key && !func){
      func = key;
      key = type;
      type = noType;
    }

    subscribed.push({
      type: type,
      key: key,
      func: func
    });
  };

  this.flush = function(){
    log("cache flush");
    subscribed = [];
    cachedObjects = {};
  };

  if(options.flushInterval > 0 ){
    setInterval(self.flush, options.flushInterval * 1000);
  }

  if(options.refreshInterval > 0){
    setInterval(function(){
      for(var i = 0; i < subscribed.length; i++){
        (function(cachedObj){
          cachedObj.func(function(err, res){
            if(err){
              log("cache sub error:");
              log(err);
            } else {
              log("refreshing " + cachedObj.type + ':' + cachedObj.key);
              self.set(cachedObj.type, cachedObj.key, res);
            }
          });
        })(subscribed[i]);
      }
    }, options.refreshInterval * 1000);
  }

};

module.exports = cache;
