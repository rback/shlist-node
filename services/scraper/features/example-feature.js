/**
 * Example feature that demonstrates some cool things that can be done with features.
 *
 * @param {Object} app
 *    Express application instance.
 *
 * @param {*} config
 *    The configuration from the config file.
 */
module.exports = function (app, config) {
  console.log('example-feature says: I\'m alive!', config);

  // The server is not yet started when the features are initialized. The 'serverStart'
  // event can be caught to do things after the server has been started.
  app.on('serverStart', function () {
    var server = app.server;
    console.log('example-feature says: hello server!');
  });

  // The 'appReady' event is emitted after all features have been initialized and just
  // before the server is started. Here you can for example wire different features
  // together.
  app.on('appReady', function () {
    console.log('example-feature says: app is ready');
  });

  // Feature is a good place to register Express middleware.
  app.use(function (req, res, next) {
    // Add a custom header to each response.
    res.set('X-Example-Header', '42');
    next();
  });

  // Any properties added to `this` are exposed to the other parts of the application
  // through `app.feature('example-feature')`. For example this method can be called
  // like this: `app.feature('example-feature').exampleFeatureMethod('foo');`.
  this.exampleFeatureMethod = function (message) {
    console.log('example-feature says:', message)
  };
};
