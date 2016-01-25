var _ = require('lodash')
  , fs = require('fs')
  , path = require('path')
  , gulp = require('gulp')
  , jshint = require('gulp-jshint')
  , watch = require('gulp-watch')
  , gutil = require('gulp-util')
  , jsdoc = null
  , stylish = require('jshint-stylish')
  , args = require('minimist')(process.argv.slice(2))
  , spawn = require('child_process').spawn
  , domain = require('domain')
  , through = require('through')
  , Mocha = require('mocha')
  , moment = require('moment')
  , dbUtils = require('yessql-core/database/db-utils')
  , serviceCreator = require('yessql-core/utils/service-creator');

try {
  jsdoc = require('gulp-jsdoc')
} catch (e) {
  gutil.log(gutil.colors.yellow('gulp-jsdoc not found, jsdoc cannot be generated'));
}

// Spawned service processes.
var serviceProcesses = {};

// Arguments read from command line.
var selectedConf = args.config || "development";

// Directory for services.
var serviceDir = path.join(__dirname, 'services');

// Directory for generated jsdoc.
var jsdocDir = path.join(__dirname, 'jsdoc');

// Various filesets used in tasks.
var yessqlCoreSource = path.join(__dirname, 'node_modules/yessql-core/**/*.js');
var yessqlFeatureSource = path.join(__dirname, 'node_modules/yessql-features/**/*.js');
var serviceSource = path.join(serviceDir, '*', '**/*.js');

// Create services folder if it doesn't exist.
if (!fs.existsSync(serviceDir)) {
  fs.mkdirSync(serviceDir);
}

// Names of all the services.
var serviceNames = _.filter(fs.readdirSync(serviceDir), function(fileName) {
  return fileName.charAt(0) !== '.';
});

// jshint options. Loosen these if they become annoying.
// http://www.jshint.com/docs/options/
var jsHintOpts = {
  bitwise       : true,
  camelcase     : true,
  curly         : true,
  eqeqeq        : true,
  es3           : false,
  forin         : true,
  freeze        : true,
  immed         : true,
  indent        : 2,
  latedef       : 'nofunc',
  newcap        : true,
  noarg         : true,
  noempty       : true,
  nonbsp        : true,
  nonew         : true,
  plusplus      : false,
  quotmark      : false,
  undef         : true,
  unused        : true,
  strict        : true,
  /* Yes we do enforce automatic code quality checks? */
  maxparams     : 10,
  maxdepth      : 7,
  maxstatements : 300,
  maxcomplexity : 7,
  maxlen        : 128,
  laxcomma      : true, /* allow comma in the start of line */
  laxbreak      : true, /* allow operators in the start of line */
  node          : true,
  mocha         : true
};

///////////////////////////////////////
//
// Task declarations.
//

// Generate tasks for each service.
_.each(serviceNames, function (serviceName) {
  gutil.log(gutil.colors.green("Registering tasks for: ") + serviceName);

  var configPath = path.join(serviceDir, serviceName, 'config', selectedConf);
  var config = require(configPath);

  gulp.task('serve:' + serviceName, function () { 
    spawnService(serviceName, selectedConf); 
  });
  
  gulp.task('test:' + serviceName, function () { 
    runTests(serviceName); 
  });
  
  gulp.task('new-migration:' + serviceName, function () {
    createNewMigrationScript(serviceName, args.name);
  });
  
  gulp.task('db-create:' + serviceName, function () {
    var dbManager = dbUtils(config.database);
    return dbManager
      .createDb()
      .bind(dbManager)
      .finally(dbManager.close)
      .catch(fail);
  });
  
  gulp.task('db-migrate:' + serviceName, function () {
    var dbManager = dbUtils(config.database);
    return dbManager
      .migrateDb()
      .bind(dbManager)
      .finally(dbManager.close)
      .catch(fail);
  });
  
  gulp.task('db-version:' + serviceName, function () {
    var dbManager = dbUtils(config.database);
    return dbManager
      .dbVersion()
      .bind(dbManager)
      .finally(dbManager.close)
      .catch(fail);
  });
  
  gulp.task('db-drop:' + serviceName, function () {
    var dbManager = dbUtils(config.database);
    return dbManager
      .dropDb()
      .bind(dbManager)
      .finally(dbManager.close)
      .catch(fail);
  });
  
  gulp.task('db-truncate:' + serviceName, function () {
    var dbManager = dbUtils(config.database);
    return dbManager
      .truncateDb()
      .bind(dbManager)
      .finally(dbManager.close)
      .catch(fail);
  });
  
  gulp.task('db-populate:' + serviceName, function () {
    var dbManager = dbUtils(config.database);
    return dbManager
      .populateDb()
      .bind(dbManager)
      .finally(dbManager.close)
      .catch(fail);
  });
});

// Watch changes and run style checks.
gulp.task('watch-lint', function () {
  gulp.src([serviceSource])
    .pipe(watch(function(files) {
      return files
        .pipe(jshint(jsHintOpts))
        .pipe(jshint.reporter(stylish, { verbose: true }));
    }));
});

gulp.task('lint', function () {
  gulp.src([serviceSource])
    .pipe(jshint(jsHintOpts))
    .pipe(jshint.reporter(stylish, { verbose: true }));
});

if (jsdoc !== null) {
  // Generate jsdoc.
  gulp.task('jsdoc', function () {
    gulp.src([yessqlCoreSource, yessqlFeatureSource, serviceSource]).pipe(jsdoc(jsdocDir));
  });
}

// Generate new service from template.
gulp.task('new-service', function () {
  var serviceName = args.name;
  if (!serviceName) {
    console.error(gutil.colors.red('specify service name with --name argument'));
    return;
  }
  return serviceCreator(serviceDir, args.name, args.database, args.example);
});

// Print help about available commands.
gulp.task('default', function () {
  gutil.log(gutil.colors.cyan("-------------------------- SERVICES --------------------------"));
  gutil.log(gutil.colors.yellow(serviceNames.join(', ')));
  gutil.log(gutil.colors.cyan("--------------------------- TASKS ----------------------------"));
  gutil.log(gutil.colors.yellow("gulp jsdoc"));
  gutil.log(gutil.colors.yellow("gulp lint"));
  gutil.log(gutil.colors.yellow("gulp watch-lint"));
  gutil.log(gutil.colors.yellow("gulp new-service --name <servicename> [--example] [--database <dbname>]"));
  gutil.log(gutil.colors.yellow("gulp test:<servicename>"));
  gutil.log(gutil.colors.yellow("gulp [--config <config-file>] serve:<servicename>"));
  gutil.log(gutil.colors.yellow("gulp [--config <config-file>] db-create:<servicename>"));
  gutil.log(gutil.colors.yellow("gulp [--config <config-file>] db-migrate:<servicename>"));
  gutil.log(gutil.colors.yellow("gulp [--config <config-file>] db-version:<servicename>"));
  gutil.log(gutil.colors.yellow("gulp [--config <config-file>] db-drop:<servicename>"));
  gutil.log(gutil.colors.yellow("gulp [--config <config-file>] db-truncate:<servicename>"));
  gutil.log(gutil.colors.yellow("gulp [--config <config-file>] db-populate:<servicename>"));
  gutil.log(gutil.colors.yellow("gulp [--config <config-file>] new-migration:<servicename> [--name <migrationname>]"));
  gutil.log(gutil.colors.cyan("--------------------------------------------------------------"));
});

///////////////////////////////////////
//
// Helper function implementations.
//

// Runs tests for given service.
function runTests(serviceName) {
  return gulp.src(path.join(serviceDir, serviceName, 'tests/**/*.js'), {read: false})
    .pipe(mochaRunner({reporter: 'spec', bail: false, timeout: 10000}))
    .on('end', function() {
      process.exit();
    });
}

// Spawns service process
function spawnService(serviceName, config) {
  // Kill old one first then spawn new one.
  if (serviceProcesses[serviceName]) {
    serviceProcesses[serviceName].kill();
  }

  var configPath = path.join(serviceDir, serviceName, 'config', config);
  var mainFilePath = path.join(__dirname, 'node_modules', 'yessql-core', 'app.js');
  
  var args = ['--', mainFilePath, '--config', configPath];

  if (process.env.PORT !== undefined) {
    args.push('--port');
    args.push(process.env.PORT.toString());
  }

  var serviceProcess = spawn("node", args, {cwd: process.cwd()});

  serviceProcess.stdout.setEncoding('utf8');
  serviceProcess.stdout.on('data', function (data) {
    logChunk(data, serviceName, 'green');
  });

  serviceProcess.stderr.setEncoding('utf8');
  serviceProcess.stderr.on('data', function (data) {
    logChunk(data, serviceName, 'red');
  });

  serviceProcess.on('close', function (code) {
    gutil.log(gutil.colors.green(serviceName + ": ") + "Done with exit code", code);
    gutil.log(gutil.colors.green(serviceName + ": ") + "You access complete stdout and stderr from here");
  });

  serviceProcess.on('exit', function (code) {
    gutil.log(gutil.colors.green(serviceName + ": ") + "End of process with exit code", code);
  });

  serviceProcesses[serviceName] = serviceProcess;
  return serviceProcess;
}

// Removes whitespace from end of string.
function rtrim(stringToTrim) {
  return stringToTrim.replace(/\s+$/,"");
}

// Make sure to send kill signal to all spawned services before exit.
function cleanupOnExit() {
  gutil.log(gutil.colors.green("Gulp exiting:") + " Killing remaining service processes.");
  _.each(serviceProcesses, function (process, key) {
    process.kill();
    gutil.log(gutil.colors.green("Nicely killed process: ") + key);
  });
}

function logChunk(chunk, name, color) {
  chunk.split('\n').map(rtrim).filter(_.identity).forEach(function(line) {
    gutil.log(gutil.colors[color](name + ":"), line);
  });
}

function logError(err) {
  gutil.log(gutil.colors.red(err));
}

function fail(err) {
  logError(err);
  process.exit(1);
}

// catch ctrl-c
process.on('SIGINT', function () {
  process.exit();
});

process.on('exit', cleanupOnExit);

// Modified version of the gulp-mocha library.
function mochaRunner(options) {
  var mocha = new Mocha(options);
  var cache = {};

  for (var key in require.cache) {
    cache[key] = true;
  }

  function clearCache() {
    for (var key in require.cache) {
      if (!cache[key]) {
        delete require.cache[key];
      }
    }
  }

  var hasTests = false;
  return through(function (file) {
    mocha.addFile(file.path);
    hasTests = true;
    this.queue(file);
  }, function () {
    var stream = this;
    var d = domain.create();
    var runner;

    function handleException(err) {
      if (runner) {
        runner.uncaught(err);
      } else {
        clearCache();
        stream.emit('error', new gutil.PluginError('gulp-mocha', err));
      }
    }

    d.on('error', handleException);
    d.run(function () {
      try {
        runner = mocha.run(function () {
          clearCache();
          stream.emit('end');
        });

        runner.on('end', function () {
          clearCache();
          stream.emit('end');
        });

      } catch (err) {
        handleException(err);
      }
    });
  });
}

// Creates a new migration script for a service.
// TODO: just copy a template from the yessql-core/service-template dir.
function createNewMigrationScript(serviceName, migrationName) {
  migrationName = migrationName || 'new_migration';
  var currentUtc = moment().utc().format("YYYYMMDDHHmmss");
  var configPath = path.join(serviceDir, serviceName, 'config', selectedConf);
  var config = require(configPath);
  var migrationFileName = path.join(config.database.migrationsDir, currentUtc + '_' + migrationName + '.js');

  var template = [
    "var _ = require('lodash');",
    "",
    "// see http://knexjs.org/#Schema ",
    "exports.up = function (knex) {",
    "  return knex.schema.table('MyTable', function (table) {",
    "    table.timestamp('createTime').notNullable().defaultTo(knex.raw('now()'));",
    "  });",
    "};",
    "",
    "exports.down = function (knex) {",
    "};"
  ];

  fs.writeFile(migrationFileName, template.join("\n"), function(err) {
    if (err) {
      console.error(err);
    } else {
      gutil.log(gutil.colors.green("Created new migration script:"), gutil.colors.yellow(migrationFileName));
    }
  });
}
