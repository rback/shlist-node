var serviceRootDir = __dirname + '/..'
  , frameworkRootDir = __dirname + '/../../..'
  , RedisSessionStore = require('yessql-features/token-session').RedisSessionStore;

module.exports = {
  port: 8081,

  // Possible values ['http', 'https']
  protocol: 'http',

  // Possible values ['development', 'testing', 'production']
  profile : 'development',

  // This object is only needed if protocol === 'https'.
  ssl: {
    key: serviceRootDir + '/some/path/to/key/file.key',
    cert: serviceRootDir + '/some/path/to/cert/file.crt',
    passphrase: 'gleba'
  },

  // Database configuration. This can also be a function that takes a Request object
  // as input and returns a configuration object. This way the database can be selected
  // per request.
  database: {
    // Possible values 'postgres', 'sqlite' and 'mysql'.
    client: 'postgres',

    // Database server address.
    host: '192.168.99.100',

    // Database server port.
    port: 5432,

    // Database name (file path for sqlite).
    database: 'scraper',

    // Collation to use. The first one that is supported by the database is used.
    collate: ['fi_FI.UTF-8', 'en_US.utf8'],

    // Optional username.
    user: 'postgres',

    // Optional password.
    password: undefined,

    // Username with super user rights. This is used for creating/dropping databases and for other
    // "super user" stuff mainly by different gulp tasks.
    superUser: 'postgres',

    // Optional super user password.
    superPassword: undefined,

    // Minimum size for the connection pool.
    minConnectionPoolSize: 0,

    // Maximum size for the connection pool.
    maxConnectionPoolSize: 10,

    // Function to run on newly created DB connections, before they are used for queries.
    // Can be used to further configure the DB session.
    //
    // Takes the native DB driver connection object as an argument, and a callback which
    // accepts the reconfigured connection as an argument. Example for postgres:
    //
    // afterConnectionCreate: function (conn, cb) {
    //   conn.query('SET timezone="UTC";', function (err) {
    //     cb(err, conn);
    //   });
    // },
    afterConnectionCreate: null,

    // Like afterConnectionCreate, but is ran before a connection is disconnected, after
    // all queries using it have finished executing.
    beforeConnectionDestroy: null,

    // Absolute file path to the migrations folder.
    migrationsDir: serviceRootDir + '/data/migrations',

    // The name of the table that stores the migration information.
    migrationsTable: 'migrations',

    // Glob pattern for database populate files.
    populatePathPattern: serviceRootDir + '/data/populate/*.js'
  },

  // The directories from which to search for the features.
  featurePaths: [
    frameworkRootDir + '/node_modules/yessql-features',
    serviceRootDir + '/features'
  ],

  // The features to enable for the service. See yessql-features for documentation.
  features: [
    {
      feature: 'logger',
      config: 'dev'
    },

    {
      feature: 'compression',
      config: {
        threshold: 0
      }
    },

    {
      feature: 'cors',
      config: {
        allowHeaders: ['X-Requested-With', 'X-Auth-Token', 'Content-Type', 'Range'],
        allowMethods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'HEAD', 'OPTIONS'],
        allowOrigins: ['*'],
        allowCredentials: true
      }
    },

    {
      feature: 'token-session',
      config: {
        storeClass: RedisSessionStore,
        storeOptions: {
          ttlSeconds: 60 * 60 * 24,
          host: '192.168.99.100',
          port: 6379
        }
      }
    },

    { feature: 'body-parser' },
    { feature: 'database' },

    {
      feature: 'database-bind-models',
      config: {
        modelPaths: [
          serviceRootDir + '/models/**',
          serviceRootDir + '/features/*/models/**',
          frameworkRootDir + '/node_modules/yessql-features/*/models/**'
        ]
      }
    },

    {
      feature: 'auth',
      config: {
        readSessionUserFromDb: false
      }
    },

    {
      feature: 'example-feature',
      config: {
        some: 'config value'
      }
    },

    {
      feature: 'route',
      config: {
        routePaths: [
          serviceRootDir + '/routes/**'
        ]
      }
    },

    {
      feature: 'error-handler',
      config: {
        handlerPaths: [],
        handlers: [
          'postgres',
          'http'
        ]
      }
    }
  ]
};
