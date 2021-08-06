const { assert } = require('chai');

const { findUser } = require('../helpers/helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  }
}

describe('findUser', function() {
  it('should return parent object of email given', function() {
    const user = findUser(testUsers, "user@example.com")
    const expectedOutput = testUsers['userRandomID']

    assert.equal(user, expectedOutput)
  });
  it('should return false if email does not exist', function() {
    const user = findUser(testUsers, "fake@email.com")
    const expectedOutput = false

    assert.equal(user, expectedOutput)
  });
});

