const generateRandomString = function() {
  const str = Math.random().toString(36).substring(7);
  return str;
};

const containsEmail = function(email, users) {
  for (const user in users) {
    if (email === users[user].email) {
      return true;
    }
  }
  return false;
};

const findUserFromEmail = (email, users) => {
  for (const user in users) {
    if (users[user].email === email) {
      return user;
    }
  }
};

const urlsForUser = function(id, database) {
  const filtered = {};
  for (const shortUrl in database) {
    if (id === database[shortUrl].userID) {
      filtered[shortUrl] = database[shortUrl].longURL;
    }
  }
  return filtered;
};

module.exports = {generateRandomString, containsEmail, findUserFromEmail, urlsForUser};