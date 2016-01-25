#YesSQL

 - [Introduction](#markdown-header-introduction)
 - [Getting started](#markdown-header-getting-started)
 - [Read more](#markdown-header-read-more)

##Introduction

*YesSQL* is a lightweight framework for building service oriented *node.js* backends using relational databases. The
framework is somewhat opinionated and here's what it thinks:

 1. **Don't abstract away SQL.**
    This framework is built around the wonderful [knex.js](http://knexjs.org/) SQL query builder. There is no ORM trying
    to force its way of doing things. Not using an ORM can lead to a lot of boilerplate code. For that reason the
    *[SqlModel](#markdown-header-sqlmodel)* class provides some ORMish features to make basic operations easy. Unlike 
    usual ORMs *SqlModel* doesn't enforce anything. If you want you can just forget about the relation mapping stuff
    and use SQL. 

 2. **Promises are awesome.**
    All asynchronous operations are handled with [promises](http://promisesaplus.com/). More specifically with the
    [bluebird](https://github.com/petkaantonov/bluebird/) library. Many people seem to think that promises are just
    a glorified callback system. If you are one of those please check out [these examples](https://github.com/petkaantonov/bluebird#what-are-promises-and-why-should-i-use-them) 
    to have your testicles/ovaries explode.
    
 3. **Write small services.**
    This framework endorses a service oriented approach, but doesn't enforce it. Service is a small independent node
    application. In *YesSQL* you can write multiple services in the same project so that they all share the same
    framework code.
    
##Where is all the code?

This repository can be used as a project template, but all the actual code (apart from *Gulpfile.js*) is in the repositories
[yessql-core](https://bitbucket.org/vincit/yessql-core) and [yessql-features](https://bitbucket.org/vincit/yessql-features).
This repository imports these two as *npm* dependencies. To start a project you can simply clone this repository. When
the yessql is updated you can say `npm update` and have the latest version of *YesSQL* in your hands. If you want to lock
*YesSQL* to some version, simply configure the version (git branch/commit/tag) to the *package.json* file as instructed
[here](https://www.npmjs.org/doc/files/package.json.html).

##Getting started

*NOTE: The setup currently only works with **PostgreSQL**. In the future also **MySQL** and **sqlite** will be supported.*

First you need to start the *PostgreSQL* server. If you're a mac user all you need to do is to install 
[Postgres.app](http://postgresapp.com/) and start it.

Then run these commands:

```bash
git clone git@bitbucket.org:vincit/yessql.git
cd yessql
npm install -g gulp
npm install
# Creates a new service. Leave out --example if you don't want the example files.
gulp new-service --name my-service --example
```

Now you have a new service in the *services* folder. This is where you write your service's code. Next you should open
the configuration file of the service and configure your database user and password.

```bash
nano ./services/my-service/config/development.js
```

Set the `superUser` and `superPassword` fields of the `database` object and save the file. These credentials are used
to create the database and do other "super user stuff". Now we can create the database by running the following
commands:

```bash
# Creates the database.
gulp db-create:my-service
# Runs migrations for the database.
gulp db-migrate:my-service
```

To run the service just do this:

```bash
gulp serve:my-service
```

To test the service:

```bash
gulp test:my-service
```

By default there is one example table, one model class, one example rest API, one example feature and some integration
tests for the API. They are well documented and a good way to learn how stuff works. Leave out the `--example` flag if
you don't want the example stuff.

To start exploring *YesSQL* check out these files:

```
services/my-service/routes/example-api.js
services/my-service/test/example-tests.js
services/my-service/models/ExampleModel.js
services/my-service/features/example-feature.js
services/my-service/config/development.js
```

You can play with the REST api of the example service using these curl commands.

```bash
# First add some data.
curl -H "Content-Type: application/json" -d '{"name":"Robert", "age":71}' http://localhost:8081/api/v1/example
curl -H "Content-Type: application/json" -d '{"name":"Angelina", "age":39}' http://localhost:8081/api/v1/example
curl -H "Content-Type: application/json" -d '{"name":"Scarlet", "age":29}' http://localhost:8081/api/v1/example
curl -H "Content-Type: application/json" -d '{"name":"Jennifer", "age":24}' http://localhost:8081/api/v1/example

# Get all.
curl http://localhost:8081/api/v1/example

# Get by id.
curl http://localhost:8081/api/v1/example/1

# Update
curl -X PUT -H "Content-Type: application/json" -d '{"id":1, "name":"Robert", "age":72}' http://localhost:8081/api/v1/example/1

# Get by age.
curl http://localhost:8081/api/v1/example/byAge/28/50

# Add related models.
curl -H "Content-Type: application/json" -d '{"name":"Robert jr", "age":35}' http://localhost:8081/api/v1/example/1/exampleRelation
curl -H "Content-Type: application/json" -d '{"name":"Roberta", "age":33}' http://localhost:8081/api/v1/example/1/exampleRelation

# Get related models.
curl http://localhost:8081/api/v1/example/1/exampleRelation

# Now get the one that has relations with all his relations.
curl 'http://localhost:8081/api/v1/example/1?eager=true'
```

##Read more

 - [Gulp build system](#markdown-header-gulp-build-system)
 - [Features](#markdown-header-features)
 - [Config files](#markdown-header-config-files)
 - [SqlModel](#markdown-header-sqlmodel)
 - [Routing](#markdown-header-routing)
 - [Error handling and error responses](#markdown-header-error-handling-and-error-responses)
 - [Security and authentication](#markdown-header-security-and-authentication)

##Gulp build system

Gulp is used to automate tasks like *creating new services*, *creating and migrating databases*, *spawning services*,
*testing* etc. 

Get information about the available tasks running `gulp` without any arguments.

```
[17:46:13] Registering tasks for: my-service
[17:46:13] Using gulpfile ~/Projests/yessql/Gulpfile.js
[17:46:13] Starting 'default'...
[17:46:13] -------------------------- SERVICES --------------------------
[17:46:13] my-service
[17:46:13] --------------------------- TASKS ----------------------------
[17:46:13] gulp jsdoc
[17:46:13] gulp watch-lint
[17:46:13] gulp new-service --name <servicename> [--example] [--database <dbname>]
[17:46:13] gulp test:<servicename>
[17:46:13] gulp [--config <config-file>] serve:<servicename>
[17:46:13] gulp [--config <config-file>] db-init:<servicename>
[17:46:13] gulp [--config <config-file>] db-migrate:<servicename>
[17:46:13] gulp [--config <config-file>] db-version:<servicename>
[17:46:13] gulp [--config <config-file>] db-drop:<servicename>
[17:46:13] gulp [--config <config-file>] db-truncate:<servicename>
[17:46:13] gulp [--config <config-file>] db-populate:<servicename>
[17:46:13] gulp [--config <config-file>] new-migration:<servicename> [--name <migrationname>]
[17:46:13] --------------------------------------------------------------
[17:46:13] Finished 'default' after 1.17 ms
[17:46:13] Gulp exiting: Killing remaining service processes.
```

Create new service:

```bash
gulp new-service --name my-service [--example] [--database my-database]
```

Create database for a service:

```bash
gulp db-create:my-service
```

Run migrations for the service's database:

```bash
gulp db-migrate:my-service
```

Drop the service's database (be careful!):

```bash
gulp db-drop:my-service
```

Truncate all tables in the service's database (be careful!):

```bash
gulp db-truncate:my-service
```

Create new migration script for a service:

```bash
gulp new-migration:my-service [--name <name>]
```

jslint:

```bash
gulp serve:my-service watch-lint
```

Populate database with sample data from `service/data/populate` folder.

```bash
gulp db-populate
```

By default the *development* configuration is used for database related tasks. To change the configuration just
set the `--config` parameters like so:

```bash
gulp --config production db-migrate:my-service
```

See [the documentation for config files](#markdown-header-config-files) for more information about the database configuration.

##Features

*Features* are the building blocks of a *service*. Service is just a stack of features defined in a
[config file](#markdown-header-config-files). Features provide a way to construct a service in a modular way using 
only a declarative configuration file. There is no need to create a new *app.js* file for each service.
  
A feature is a small independent module that can optionally expose an interface to the rest of the application.
Technically features are nothing but node.js modules that export a function:

```js
module.exports = function (app, config) {
  // This method is called once when the server is started.
};
```

Feature functions are invoked in the order they are defined in the [config file](#markdown-header-config-files). The
function is given an [express](http://expressjs.com/) `Application` instance and the *feature's* configuration object
from the config file as parameters. Features are singletons and the constructor method is only invoked once. 

Features can expose methods and properties and can therefore be used as services (as in Spring framework's service).
Methods can be exposed like this:

```js
module.exports = function (app, config) {
  this.someMethod = function () {
    console.log('hello!');
  };
};
```

Other parts of the application can access the feature through the application instance like this:

```js
var someFeature = app.feature('some-feature');
someFeature.someMethod(); // --> hello!
```

The features's name is the name of the module that exports the feature constructor function.

Features are created before the server is started. If you want to do something after the server is started you can listen 
to the 'serverStart' event:

```js
module.exports = function (app, config) {
  app.on('serverStart', function () {
    var server = app.server;
  });
};
```

Because the features are initialized in the order they are defined in the configuration file some of the features you
want to use in your feature may not exist yet. In this case the 'appReady' event can be used. 'appReady' is fired after
the features have been created but before the server is started.

```js
module.exports = function (app, config) {
  var otherFeature;
  app.on('appReady', function () {
    otherFeature = app.feature('other-feature');
  });
};
```

It is very common for a feature to install [Express middleware](http://expressjs.com/4x/api.html#app.use). Actually
most of the features provided by the [yessql-features](https://bitbucket.org/vincit/yessql-features) repository install
some kind of middleware. This way the feature stack of service can also be though as pipeline through which the
request travels.

```js
module.exports = function (app, config) {
  app.use(function (req, res, next) {
    // Do something with the request or response.
    next();
  });
};
```

Features also have a simple dependency system but it doesn't try to solve the dependencies for you. 
In [express](http://expressjs.com/) the order in which you install various middleware matters, but isn't documented 
anywhere. The dependency system attempts to address this problem. You can define dependencies like this:

```js
module.exports = function (app, config) {
  // This method is called once when the server is started.
};
module.exports.dependencies = ['database', 'cookie-session|token-session'];
```

Our example feature needs the *database* feature and either *cookie-session* or *token-session* feature to be
listed in the configuration file before itself.

There is a bunch of features provided by the framework and they can be found in the [yessql-features](https://bitbucket.org/vincit/yessql-features) 
repository. Each feature has an usage example and documentation in its *index.js* file. Some features like *body-parser* and *compression* are
nothing but [express](http://expressjs.com/) middleware wrapped as features. Other features like *database* and 
*auth* do much more.

Features are searched from a list of folders defined in the [config file](markdown-header-config-files). You can add your
own feature search paths to the list.

##Config files

Services are configured with configuration files that live in the *config* folder of the service. Config files
consist of couple of constants segments that all config files have and of a list of [feature](#markdown-header-features)
configurations. Here is a typical configuration file for a service:

```js
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
    host: 'localhost',

    // Database server port.
    port: 5432,

    // Database name (file path for sqlite).
    database: 'my-service',

    // Collation to use. The first one that is supported by the database is used.
    collate: ['fi_FI.UTF-8', 'Finnish_Finland.1252'],

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
          host: 'localhost',
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
```

##SqlModel

 - [Basics](#markdown-header-sqlmodel-basics)
 - [JSON columns](#markdown-header-sqlmodel-json-columns)
 - [Relations](#markdown-header-sqlmodel-relations)
 - [Validation](#markdown-header-sqlmodel-validation)
 - [Transactions](#markdown-header-sqlmodel-transactions)

###SqlModel Basics

*SqlModel* is a base class for models that represent database tables. To create your own model you need to create a new
subclass of *SqlModel* and give it the name of a database table:
 
```js
var SqlModel = require('yessql-core/models/SqlModel')
  , classUtils = require('yessql-core/class-utils');

function MyModel() {
  SqlModel.call(this);
}

classUtils.inherits(MyModel, SqlModel);

MyModel.tableName ='MyModel';

module.exports = MyModel; 
```

The table and its schema is _not_ created automatically. *SqlModel* just assumes that such a table exists. Use
[migrations](#markdown-header-migrations) to create the table and its schema.

You can create an instance of your model using the static `.fromJson` method:

```js
var instance = MyModel.fromJson({foo: 'bar', spam: 'eggs'});
```

Creating an instance doesn't insert it to the table. See the `.insert()` method for that. The properties of the
JSON object are copied to the model and can be accessed just like normal properties:

```js
instance.foo = 'baz';
console.log(instance.spam);
```

*SqlModel* instance can be converted into a JSON object using the `.$toJson()` or `.toJSON()` methods.

*SqlModel* subclasses inherit a bunch of methods (both static and instance methods) for accessing and manipulating
the database table. 

Static methods:

```js
MyModel.find()
MyModel.findOne()
MyModel.findById()
MyModel.findWhereIn()
MyModel.findRelated()
MyModel.insert()
MyModel.update()
MyModel.delete()
MyModel.deleteById()
```

instance methods:

```js
instance.$insert()
instance.$update()
instance.$del()
instance.$findRelated()
instance.$findOneRelated()
instance.$insertRelated()
instance.$updateRelated()
instance.$delRelated()
instance.$bindRelated()
instance.$unbindRelated()
```

All of these methods return an instance of *SqlModelQueryBuilder* class that can be used just like the 
[knex.js](http://knexjs.org/) query builder. See the examples below.

Find all rows whose *age* column is greater than 20 and *gender* column equals 'male':

```js
// SELECT * FROM "MyModel" WHERE age > 20 AND gender = 'male'
MyModel
  .find()
  .where('age', '>', 20)
  .where('gender', 'male')
  .then(function (result) {
    console.log(result);
  })
  .catch(function (err) {
    console.log(err);
  });
```

This finds all males over 20 years old and the person named *Gunilla Gunillson*.

```js
// SELECT * FROM "MyModel" WHERE (age > 20 AND gender = 'male') OR (name = 'gunilla' AND "lastName" = 'Gunillson')
MyModel
  .find()
  .where(function () {
    this.where('age', '>', 20).andWhere('gender', 'male');
  })
  .orWhere(function () {
    this.where('name', 'Gunilla').andWhere('lastName', 'Gunillson');
  })
  .then(function (result) {
    console.log(result);
  });
```

Insert a new row:

```js
// INSERT INTO "MyModel" (age, name, "lastName", gender) VALUES (40, 'Gunilla', 'Gunillson', 'female')
MyModel
  .insert({
    age: 40,
    name: 'Gunilla',
    lastName: 'Gunillson',
    gender: 'female'
  })
  .then(function (result) {
    console.log(result.id);
  })
  .catch(function (err) {
    console.log(err);
  });
```

Update a row:

```js
// UPDATE "MyModel" SET age = 41 WHERE id = 1234
gunilla.age = 41;
gunilla.update().then(function (result) {
  console.log(result.age);
});
```

While knex.js query builder returns plain JSON records, *SqlModelQueryBuilder* returns *SqlModel* subclass instances.
See [knex.js](http://knexjs.org/) documentation for more examples.

###SqlModel JSON columns

SqlModel has a built-in support for saving complex documents to the database as a single row. SqlModel takes care of 
serializing and deserializing the JSON objects to single columns automatically. All you need to do is list the JSON properties
in a `jsonAttributes` array like this:

```js
MyModel.jsonAttributes = ['someJsonProp', 'someOtherJsonProp'];
```

You must also remember to use the `json` datatype of knex.js when creating the columns in a migration file:

```js
module.exports = function (knex) {
  return knex.schema.createTable('MyModel', function (table) {
    table.increments('id').primary();
    table.json('someJsonProp');
    table.json('someOtherJsonProp');
  });
};
```

If both of these things are done, you can just do this:

```js
var model = MyModel.fromJson({
  someJsonProp: {
    foo: 'object'
  }, 
  someOtherJsonProp: [1, 2, 3]
});

console.log(model.someJsonProp.foo); // --> foo

model.$insert().then(function (model) {
  return MyModel.findById(model.id);
}).then(function (modelFromDb) {
  console.log(modelFromDb.someJsonProp.foo); // --> foo
});
```

###SqlModel relations

While *SqlModel* is not a full-fledged ORM (and tries really hard not to be) it provides a mechanism for defining
relations to other models. Relations are defined by populating the static `.relationMappings` property.

Relations can be defined like this:

```js
MyModel.relationMappings = {
  myFirstRelation: {
    modelClass: SomeModel,
    relation: SqlModel.HasOneRelation,
    joinColumn: 'foreignId'
  },
  someOtherRelation: {
    modelClass: SomeOtherModel,
    relation: SqlModel.HasManyRelation,
    joinColumn: 'someId'
  },
  oneMoreRelation: {
    modelClass: YetAnotherModel,
    relation: SqlModel.ManyToManyRelation,
    join: {
      table: 'MyModel_YetAnotherModel',
      relatedIdColumn: 'yetAnotherModelId',
      ownerIdColumn: 'myModelId'
    }
  }
};
```

See the API documentation on `SqlModel.relationMappings` for more info and examples.

*SqlModel* has handy methods for accessing and manipulating related models. The following examples demonstrate a few
of them.

Create *MyModel* instance and add instance to its *myFirstRelation*:

```js
var model = null;
MyModel
  .insert({name: 'Foo'})
  .then(function (insertedModel) {
    model = insertedModel;
    console.log(insertedModel.name); // prints 'Foo'
    return insertedModel.$insertRelated('myFirstRelation', {bar: 'Baz'});
  })
  .then(function (relatedModel) {
    console.log(relatedModel.bar); // prints 'Baz'
    console.log(model.myFirstRelation.bar); // prints 'Baz'
    return relatedModel;
  });
```

The `$findRelated` method returns an instance of *SqlModelQueryBuilder* and all the methods of a *knex.js* query builder are once again available:

```js
instance
  .$findRelated('someOtherRelation')
  .where('id', '<=', 100)
  .orWhere('id', '>=', 1000)
  .then(function (results) {
    console.log(results);
    console.log(instance.someOtherRelation);
    console.log(results === instance.someOtherRelation); // prints true
  });
```

Models can always be fetched from the database with relations using the `.eager` method:

```js
MyModel
  .find()
  .where('gender', 'female')
  .eager('myFirstRelation', 'someOtherRelation')
  .then(function (results) {
    for (var i = 0; i < results.length; ++i) {
      // The relations myFirstRelation and someOtherRelation were fetched for each
      // result model automatically.
      console.log(results[i].myFirstRelation);
      console.log(results[i].someOtherRelation);
    }
  });
```

Relations can be fetched recursively by giving an object for the `.eager` method. The following example fetches the
*someOtherRelation* for each result model and *myFirstRelation* and *yetAnotherRelation* for each of the instances in
*someOtherRelation*:

```js
MyModel
  .find()
  .where('gender', 'female')
  .eager({
    someOtherRelation: ['myFirstRelation', 'yetAnotherRelation']
  })
  .then(function (results) {
    for (var i = 0; i < results.length; ++i) {
      for (var j = 0; j < results[i].someOtherRelation.length; ++j) {
        console.log(results[i].someOtherRelation[j].myFirstRelation);
        console.log(results[i].someOtherRelation[j].yetAnotherRelation);
      }
    }
  });
```

Instead of the very verbose object syntax a more concise serial syntax can be used:

```js
MyModel
  .find()
  .where('gender', 'female')
  .eager('someOtherRelation.[myFirstRelation, yetAnotherRelation]')
  .then(function (results) {
    for (var i = 0; i < results.length; ++i) {
      for (var j = 0; j < results[i].someOtherRelation.length; ++j) {
        console.log(results[i].someOtherRelation[j].myFirstRelation);
        console.log(results[i].someOtherRelation[j].yetAnotherRelation);
      }
    }
  });
```

Using the serial syntax you can easily send an eager expression for example as a query parameter of a HTTP request!.
See the `.eager` method's documentation in SqlModelQueryBuilder.js for more examples and info.


###SqlModel validation

When an *SqlModel* instance is created using `.fromJson` method its schema is automatically checked against the (optional)
`.schema` property of the model class. If defined the `.schema` property must be in [JSON schema](http://json-schema.org/)
format.

```js
MyModel.schema = {
  type: 'object',
  required: ['name'],

  properties: {
    id:       {type: ['number', 'null']},
    name:     {type: 'string', minLength: 2},
    lastName: {type: ['string', 'null'], minLength: 1},
    email:    {oneOf: [{type: 'string', format: 'email'}, {type: 'null'}]},
    age:      {type: 'number'}
    gender    {type: 'string', enum: ['male', 'female']}
  }
};
```

If a validation fails an instance of `ValidationError` is thrown. If your service has the `error-handler` feature
enabled the thrown error is automatically caught by the handler and converted to an appropriate error response.

###SqlModel transactions

This is how you do transactions with SqlModel:

```js
var resultPromise = MyModel.transaction(function (trx) {
  return MyModel
    .insert({name: 'Foo'})
    .transacting(trx)
    .then(function (result) {
      console.log(result.name); // prints 'Foo'
      return result
        .$insertRelated('someRelation', {bar: 'Baz'})
        .transacting(trx);
    })
    .then(function (result) {
      console.log(result.bar); // prints 'Baz'
      return result;
    });
});
```

Usually though you don't have to explicitly declare the transaction. The `Router` [does this for you](#markdown-header-routing).

###Routing

Defining request handlers for routes is easy using the *route* feature. Just create a module that exports a function
under the *routes* directory of a service. The function is invoked during initialization and is given an instance of
`Router` as parameter. The `Router` can be used to register routes much like in express.js.

```js
module.exports = function (router, app) {
  router
    .post('/api/someRoute')
    .auth(authorizeFunc)
    .handler(function (req, res, transaction) {
      return req.models.SomeModel
        .insert(req.body)
        .transacting(transaction);
    });
    
  router
    .get('/api/someRoute')
    .handler(function (req) {
      return req.models.SomeModel.find();
    });
};
```

There are couple of things to note about in the example above.

 - The parameter to the `.post` method is the route which can be anything *express.js* `.post` method accepts. Like
   in *express* there are also `.get`, `.put`, `.patch` and `.delete` methods for *GET*, *PUT*, *PATCH* and *DELETE* HTTP methods.
 - Unlike the *express.js* request handlers that only take two parameters our handler takes a third `transaction`
   parameter. **If** a handler function takes three parameters a *knex.js* transaction is automatically started and
   passed in as the third parameter. The transaction is committed if the promise returned from the handler is resolved.
   If the promise fails the transaction will be rolled back.
 - We never call `res.send()`, `res.json()` or a similar method. We can just return stuff from the handler function
   (an object, a string, a Promise) and it is automatically resolved and sent as a response to the request. You can
   however call `res.send()`, `res.json()` or even `res.end()` if you want.
   
See the `Router` class under the *route* feature for more info and examples.

###Error handling and error responses

Error handling with asynchronous code is usually really painful. Using the normal *node.js* callbacks you have to consider
each error. Even if there is nothing you can/want to do you have to pass it to the next callback. Promises solve this
problem elegantly. If you don't need to react to an error, just don't. The promise chain will carry the error forward 
until someone cares about it. If you include the **error-handler** feature to your service it will catch all uncaught
errors and create appropriate error responses. The framework provides the `HTTPError` class that can be used as a base
class for your custom errors. `HTTPError` can also be used without subclassing. Consider this example:

```js
// Somewhere in the request handling chain...
throw new HTTPError(400, {optionalData: 'to send with the response'});
```

If you don't catch this error anywhere it will finally be caught by the **error-handler** feature and the following
error response will be sent:

```js
{
  name: 'Bad request',
  statusCode: 400,
  data: {
    optionalData: 'to send with the response' 
  }
}
```

Naturally the status code of the response will be **400**.

Check out the documentation of the **error-handler** feature for details.

###Security and authentication

Authentication is done using two features **token-session** (or **cookie-session**) and **auth**. Here is what happens
when a request comes in:

1. The **token-session** feature checks the request headers for a session token. By default this header is 
   `X-Auth-Token`. If the header is found **token-session** attempts to fetch the session object from the
   `SessionStore` using the token as a key. If a valid session is found the session object is assigned
   to `req.session`.
   
2. The **auth** feature checks the session object for a authentication data. If authentication data is found it reads the
   `User` object from this authentication data and assigns it to `req.user`.
   
3. The request finally reaches a route handler function. The route handler can then use the `req.user` object to check
   whether the user has rights to access the route.
   
Now you may think "how do I create a session and get the user stored to the session?". That's where [passport.js](http://passportjs.org/) 
comes in. *YesSQL* supports all the authentication schemes that [passport.js](http://passportjs.org/) does. Logging in 
and creating the session data is just a matter of calling [passport.authorize()](http://passportjs.org/guide/authorize/)
with correct parameters.

Here's an example route that logs the user in using basic authentication:

```js
var passport = require('passport');
module.exports = function (router) {
  router
    .post('/api/login/basic')
    .middleware(passport.authenticate('basic', {session: true}))
    .handler(function (req, res, transaction) {
      // Send back the user and the session token.
      return {
        user: req.user,
        token: req.sessionToken
      };
    });
};
```

After the `passport.authorize()` finishes successfully a new session object is created and saved to `SessionStore`.
The user, the session and the session token are accessible through `req.user`, `req.session` and `req.sessionToken`
respectively. The client can use the `req.sessionToken` to perform subsequent requests.

Passport needs to know where to find the possible users and how to test passwords etc. All the passport related stuff
is implemented in the **auth** feature. See its documentation and code for more information.