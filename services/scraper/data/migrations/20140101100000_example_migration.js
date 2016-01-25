
// Knex.js migrations. See knex.js for detailed description about the `knex.schema` methods.
exports.up = function (knex) {
  // Create table for our model.
  return knex.schema
    .createTable('ExampleModel', function (table) {
      table.increments('id').primary();
      table.string('name').notNull();
      table.integer('age');
    })
    // We must first create the table before we can create a column that refers to it.
    .table('ExampleModel', function (table) {
      // This is the join column for the `exampleRelation`.
      table.integer('parentId').references('id').inTable('ExampleModel');
    });
};

exports.down = function (knex) {
  return knex.schema.dropTable('ExampleModel');
};
