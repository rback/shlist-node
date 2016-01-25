var _ = require('lodash')
  , Promise = require('bluebird')
  , expect = require('expect.js')
  , config = require('../config/testing')
  , testSetup = require('yessql-core/test/test-setup');

// Run the test setup and get the test helper object. You can do this in every test file.
// After the first run the same singleton object is returned. The testSetup function also
// starts the server.
/** @type {TestHelper} */
var testHelper = testSetup(config);

// The fake session token we must send with requests that require authentication.
var sessionToken = 'sessionToken';

// We fake that this user has logged in. Structure of this object depends on the
// user object used in the project. Our Example service uses the default `User`
// object (see features/auth/models/User.js). The user class can be configured in the
// **auth** feature's configuration (config.userModelClass).
var sessionUser = {
  id: 1,
  username: 'user',
  roles: ['User']
};

describe('Example tests', function () {

  // Fake login.
  before(function () {
    return testHelper.login(sessionToken, sessionUser);
  });

  // Truncate database before each test.
  beforeEach(function () {
    return testHelper.truncateDb();
  });

  describe('POST', function () {

    describe('/api/v1/example', function () {

      it('should create a new ExampleModel', function () {
        return testHelper.request
          .post('/api/v1/example')
          .body({name: 'Robert', age: 71})
          .then(function (res) {
            expect(res.statusCode).to.equal(200);
            // Check response object.
            expect(_.isNumber(res.body.id)).to.be(true);
            expect(_.omit(res.body, 'id')).to.eql({name: 'Robert', age: 71});
            // Check that the item actually got into the database.
            return testHelper.knex('ExampleModel').where('id', res.body.id);
          })
          .then(function (rows) {
            expect(_.isNumber(rows[0].id)).to.be(true);
            expect(_.omit(rows[0], 'id')).to.eql({name: 'Robert', age: 71, parentId: null});
          });
      });

      it('should fail without a name', function () {
        return testHelper.request
          .post('/api/v1/example')
          .body({age: 71})
          .then(function (res) {
            expect(res.statusCode).to.equal(400);
            // Check response object.
            expect(res.body.data).to.have.property('name');
            // Check that the item didn't get into the database.
            return testHelper.knex('ExampleModel');
          })
          .then(function (rows) {
            expect(rows.length).to.equal(0);
          });
      });

    });

    describe('/api/v1/secureExample', function () {

      it('should create a new ExampleModel', function () {
        return testHelper.request
          .post('/api/v1/secureExample')
          .body({name: 'Robert', age: 71})
          .header('X-Auth-Token', sessionToken)
          .then(function (res) {
            expect(res.statusCode).to.equal(200);
            // Check response object.
            expect(_.isNumber(res.body.id)).to.be(true);
            expect(_.omit(res.body, 'id')).to.eql({name: 'Robert', age: 71});
            // Check that the item actually got into the database.
            return testHelper.knex('ExampleModel').where('id', res.body.id);
          })
          .then(function (rows) {
            expect(_.isNumber(rows[0].id)).to.be(true);
            expect(_.omit(rows[0], 'id')).to.eql({name: 'Robert', age: 71, parentId: null});
          });
      });

      it('should fail without session token', function () {
        return testHelper.request
          .post('/api/v1/secureExample')
          .body({name: 'Robert', age: 71})
          .then(function (res) {
            expect(res.statusCode).to.equal(401);
            // Check that the item didn't get into the database.
            return testHelper.knex('ExampleModel');
          })
          .then(function (rows) {
            expect(rows.length).to.equal(0);
          });
      });

    });

  });

  describe('GET', function () {

    // Create some test rows for each test.
    beforeEach(function () {
      return Promise.all([
        testHelper.knex('ExampleModel').insert({name: 'Robert', age: 71}),
        testHelper.knex('ExampleModel').insert({name: 'Angelina', age: 39}),
        testHelper.knex('ExampleModel').insert({name: 'Scarlet', age: 29}),
        testHelper.knex('ExampleModel').insert({name: 'Jennifer', age: 24})
      ]);
    });

    describe('/api/v1/example', function () {

      it('should fetch all rows', function () {
        return testHelper.request
          .get('/api/v1/example')
          .then(function (res) {
            expect(res.statusCode).to.equal(200);
            expect(res.body).to.have.length(4);
            expect(_.where(res.body, {name: 'Robert', age: 71})).to.have.length(1);
            expect(_.where(res.body, {name: 'Angelina', age: 39})).to.have.length(1);
            expect(_.where(res.body, {name: 'Scarlet', age: 29})).to.have.length(1);
            expect(_.where(res.body, {name: 'Jennifer', age: 24})).to.have.length(1);
          });
      });

    });

    describe('/api/v1/example/byAge', function () {

      it('should fetch rows with 30 <= age <= 100', function () {
        return testHelper.request
          .get('/api/v1/example/byAge/30/100')
          .then(function (res) {
            expect(res.statusCode).to.equal(200);
            expect(res.body).to.have.length(2);
            expect(_.where(res.body, {name: 'Robert', age: 71})).to.have.length(1);
            expect(_.where(res.body, {name: 'Angelina', age: 39})).to.have.length(1);
          });
      });

    });

  });

});
