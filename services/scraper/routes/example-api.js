"use strict";

var ValidationError = require('yessql-core/errors/ValidationError')
  , SqlModel = require('yessql-core/models/SqlModel');

// Simple REST api for our ExampleModel. All models that we create in our 'scraper/models'
// folder can be accessed through the `req.models` object. This is because of the *database-bind-models*
// feature that this service has included in the config file. See the feature's documentation for more info.
//
// All routes except `/api/v1/secureExample` are open and require no login or credentials to keep the example
// simple. The `api/v1/secureExample` demonstrates how to require authentication. See README.md for more
// information about security and authentication.

module.exports = function (router, app) {

  // Features can be accessed like this.
  var exampleFeature = app.feature('example-feature');

  exampleFeature.exampleFeatureMethod('registering request handlers');

  /**
   * Add an instance of `ExampleModel` to the database.
   */
  router
    .post('/api/v1/example')
    .handler(function (req, res, transaction) {
      return req.models.ExampleModel
        .insert(req.body)
        .transacting(transaction);
    });

  /**
   * Add an instance of `ExampleModel` to the database.
   *
   * This route requires the user to be logged in.
   */
  router
    .post('/api/v1/secureExample')
    .auth(function (req, transaction) {
      // Returning false (or a promise that resolves to false) from this method would
      // deny access and cause a 403 response to be sent. Usually you want to use the
      // logged-in user in this function to check access rights. The user can be
      // accessed through `req.user`.
      //
      // Calling `.auth()` without arguments simply checks that there is a logged-in
      // user. Basically it does this:
      return !!req.user;
    })
    .handler(function (req, res, transaction) {
      return req.models.ExampleModel
        .insert(req.body)
        .transacting(transaction);
    });

  /**
   * Get all instances of `ExampleModel` from the database.
   */
  router
    .get('/api/v1/example')
    .handler(function (req) {
      return req.models.ExampleModel.find();
    });

  /**
   * Get one instance of `ExampleModel`.
   *
   * If you pass the `eager=true` query parameter the model is returned with
   * `exampleRelation` recursively.
   */
  router
    .get('/api/v1/example/:id')
    .handler(function (req) {
      return req.models.ExampleModel
        .findById(req.params.id)
        .eager(function () {
          if (req.query.eager === 'true') {
            return {exampleRelation: SqlModel.EagerType.Recursive};
          }
        });
    });

  /**
   * Update an instance of `ExampleModel`.
   */
  router
    .put('/api/v1/example/:id')
    .handler(function (req) {
      // Make sure we don't try to change the object's id.
      if (req.body.id != req.params.id) {
        // This exception is automatically caught by the *error-handler* feature and converted
        // into a 400 status code and a JSON response that contains the object we passed to the
        // ValidationError's constructor.
        throw new ValidationError({id: 'id must equal the one specified in the url'});
      }
      return req.models.ExampleModel.update(req.body);
    });

  /**
   * Delete an instance of `ExampleModel`.
   */
  router
    .delete('/api/v1/example/:id')
    .handler(function (req) {
      return req.models.ExampleModel.deleteById(req.params.id);
    });

  /**
   * Find all example instances whose age is between `startAge` and `endAge`.
   */
  router
    .get('/api/v1/example/byAge/:startAge/:endAge')
    .handler(function (req) {
      return req.models.ExampleModel
        .find()
        .where('age', '>=', req.params.startAge)
        .andWhere('age', '<=', req.params.endAge);
    });

  /**
   * Add related instance.
   */
  router
    .post('/api/v1/example/:id/exampleRelation')
    .handler(function (req, res, transaction) {
      return req.models.ExampleModel
        .findById(req.params.id)
        .transacting(transaction)
        .then(function (parent) {
          return parent.$insertRelated('exampleRelation', req.body).transacting(transaction);
        });
    });

  /**
   * Get all related instances of an instance.
   */
  router
    .get('/api/v1/example/:id/exampleRelation')
    .handler(function (req) {
      return req.models.ExampleModel
        .findById(req.params.id)
        .then(function (parent) {
          return parent.$findRelated('exampleRelation');
        });
    });
};
