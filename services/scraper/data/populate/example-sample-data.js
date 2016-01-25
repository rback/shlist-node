module.exports = function(knex) {
  return knex('ExampleModel')
    .returning('id')
    .insert([
      {name: 'Robert', age: 71},
      {name: 'Angelina', age: 39},
      {name: 'Scarlet', age: 29},
      {name: 'Jennifer', age: 24}
    ])
    .then(function (ids) {
      return knex('ExampleModel').insert([
        {name: 'Robert jr', age: 35, parentId: ids[0]},
        {name: 'Roberta', age: 33, parentId: ids[0]}
      ]);
    });
};