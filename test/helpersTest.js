const { assert } = require('chai');
const { findUserFromEmail} = require('../helpers/helpers');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('findUserFromEmail', () => {
  it('should return a user with valid email', function() {
    const user = findUserFromEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    assert.strictEqual(user, expectedOutput);
  });

  it('should return undefined for emails not in the database', () => {
    const user = findUserFromEmail("1234@example.com", testUsers);
    assert.isUndefined(user);
  });
});