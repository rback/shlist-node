"use strict";

var _ = require('lodash')
  , SqlModel = require('yessql-core/models/SqlModel')
  , classUtils = require('yessql-core/class-utils');

/**
 * Example model class that inherits from *SqlModel*.
 *
 * @see README.md for more information about *SqlModel*.
 *
 * @extends SqlModel
 * @constructor
 */
function ExampleModel() {
  SqlModel.call(this);
}

/**
 * Javascript inheritance is a bit ugly. Always remember to add this line.
 */
classUtils.inherits(ExampleModel, SqlModel);

/**
 * The database table which this class represents.
 *
 * The database is not created automatically. You must create the database using migrations.
 *
 * @see README.md for more information about migrations.
 */
ExampleModel.tableName = 'ExampleModel';

/**
 * Expected JSON schema of this model.
 *
 * @see README.md for more information about *SqlModel* schema.
 */
ExampleModel.schema = {
  type: 'object',
  required: ['name'],

  properties: {
    id       : {type: ['integer', 'null']},
    name     : {type: 'string', minLength: 1, maxLength: 255},
    age      : {type: 'integer', min: 0},
    parentId : {type: ['integer', 'null']}
  }
};

/**
 * Our example model has one relation to itself.
 *
 * @see README.md for more information about *SqlModel* relations.
 */
ExampleModel.relationMappings = {
  exampleRelation: {
    relation: SqlModel.HasManyRelation,
    modelClass: ExampleModel,
    joinColumn: 'parentId'
  }
};

/**
 * You can define class methods like this.
 */
ExampleModel.someClassMethod = function () {
  return 'Hello world!';
};

/**
 * You can define instance methods like this.
 */
ExampleModel.prototype.someInstanceMethod = function () {
  return 'Hello from instance method!';
};

module.exports = ExampleModel;
