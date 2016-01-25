var baseConf = require('./development')
  , ConfigManager = require('yessql-core/utils/ConfigManager')
  , MemorySessionStore = require('yessql-features/token-session').MemorySessionStore;

baseConf.profile = 'testing';
baseConf.database.database = 'scraper-test';

// Disable pooling for tests. This is needed because we usually drop the database multiple times
// during a test session and we don't want any dangling connections to die because of that.
baseConf.database.maxConnectionPoolSize = 1;

var conf = new ConfigManager(baseConf);
// Remove request information logging during testing.
conf.removeFeature('logger');

// Use memory session store instead of Redis during testing. This eliminates the need
// to start Redis. The only downside is that the RedisSessionStore is not tested, but
// it should be tested separately anyways.
conf.feature('token-session').storeClass = MemorySessionStore;

module.exports = baseConf;
