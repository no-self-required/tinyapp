const { assert } = require('chai');

const { createNewUser, findUser, urlsForUser } = require('../helpers/helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  }
}

const testDatabase = {
  rt4Y76: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID"
  } 
};

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

describe('urlsForUser', function() {
  it('should return object of urls of given id ', function() {
    const user = urlsForUser(testDatabase, testUsers['userRandomID'].id)

    console.log(user)
    console.log(testDatabase)

    const expectedOutput = {    
      rt4Y76: { longURL: 'http://www.lighthouselabs.ca', userID: 'userRandomID' }   
    }

    assert.equal(user, expectedOutput)
  });
  // it('should return false if email does not exist', function() {
  //   const user = findUser(testUsers, "fake@email.com")
  //   const expectedOutput = false

  //   assert.equal(user, expectedOutput)
  // });
});

// describe('createNewUser', function() {
//   it()
// })
