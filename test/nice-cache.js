var should = require('should');
var niceCache = require('../');

describe('niceCache.set', function(){

  var cache;

  before(function(done){
    cache = new niceCache({
      singleton: false
    });
    cache.flush();
    done();
  });

  it('should retrieve a value for a specific key', function(done){
    cache.set('key', 'value');
    cache.get('key').should.be.eql('value');
    done();
  });

  it('should retrieve a value for a specific key and type', function(done){
    cache.set('type', 'key', 'someValue');
    cache.get('type', 'key').should.be.eql('someValue');
    done();
  });

  it('should override a value when multiple sets are performed', function(done){
    cache.set('name', 'John');
    cache.set('name', 'Pier');
    cache.get('name').should.be.eql('Pier');
    done();
  });
});

describe('niceCache.flush', function(){
  it('should flush the cache', function(done){
    var cache = new niceCache();

    cache.set('a', 'b');
    cache.set('b', 'c');

    cache.flush();

    var aIsUndefined = (typeof(cache.get('a')) === 'undefined'),
        bIsUndefined = (typeof(cache.get('b')) === 'undefined');

    aIsUndefined.should.be.eql(true);
    bIsUndefined.should.be.eql(true);
    done();
  });
});

describe('niceCache.get', function(){
  it('should get an undefined in case of a not existing key', function(done){
    var cache = new niceCache(),
        value = cache.get('notExisting');

    var valueIsUndefined = (typeof(value) === 'undefined');

    valueIsUndefined.should.be.eql(true);
    done();
  });

  it('should get an undefined in case of an expired key', function(done){
    var cache = new niceCache({
      flushInterval: 0.005,
      singleton: false
    });

    cache.set('key', 'value');

    setTimeout(function(){
      var valueIsUndefined = (typeof(cache.get('key')) === 'undefined');

      valueIsUndefined.should.be.eql(true);
      done();
    }, 10);
  });
});

describe('niceCache.refresh', function(){

  var cache;
  beforeEach(function(){
    cache = new niceCache({
      refreshInterval: 30
    });
  });

  it('should return error if trying to refresh a key that is not present', function(done){
    cache.refresh('key', function(err, result){
      err.should.be.eql('not found');
      done();
    });
  });

  it('should return error if trying to refresh a key that is not subscribed to any handler', function(done){
    cache.set('key', '12345');

    cache.refresh('key', function(err, result){
      err.should.be.eql('not found');
      done();
    });
  });

  it('should refresh the value when refreshing a key subscribed to a refresh handler', function(done){

    var c = 0;
    var getLatestC = function(callback){
      c++;
      callback(null, c);
    };

    cache.set('key', -1);
    cache.sub('key', getLatestC);

    cache.get('key').should.be.eql(-1);
    
    cache.refresh('key', function(err, result){
      result.should.be.eql(1);
      cache.get('key').should.be.eql(1);
      done();
    });
  
  });
});

describe('niceCache.sub', function(){
  it('should allow a key to be refreshed in case of a refreshInterval option', function(done){
    var cache = new niceCache({
      refreshInterval: 0.01,
      singleton: false
    });

    cache.set('key', 12345);

    var c = 0;

    var updateKey = function(callback){
      c++;
      callback(null, c);
    };

    cache.sub('key', updateKey);

    cache.get('key').should.be.eql(12345);
    setTimeout(function(){
      cache.get('key').should.be.eql(1);
      setTimeout(function(){
        cache.get('key').should.be.eql(2);
        done();
      }, 10);
    }, 11);
  });

  it('shouhldn\'t update a key when the subscribed delegate returns an error', function(done){
    var cache = new niceCache({
      refreshInterval: 0.005,
      singleton: false
    });

    cache.set('type', 'key', 111);
    cache.sub('type', 'key', function(callback){
      callback('An error', null);
    });
    setTimeout(function(){
      cache.get('type', 'key').should.be.eql(111);
      done();
    }, 0.01);
  });
});

describe('niceCache', function(){
  it('should not be a singleton when singleton = false', function(done){
    var cache1 = new niceCache();

    cache1.flush();
    cache1.set('key', '0000');

    var cache2 = new niceCache({
      singleton: false
    });

    cache2.flush();
    cache2.set('key', '0001');

    cache1.get('key').should.be.eql('0000');
    cache2.get('key').should.be.eql('0001');
    done();
  });

  it('should be a singleton when singleton = true', function(done){
    var cache1 = new niceCache({
      singleton: true
    });

    cache1.flush();
    cache1.set('key', '0000');

    var cache2 = new niceCache({
      singleton: true
    });

    cache2.get('key').should.be.eql('0000');
    done();
  });
});
