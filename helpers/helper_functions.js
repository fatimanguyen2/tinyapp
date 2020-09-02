const generateRandomString = function generateRandomString() {
  const str = Math.random().toString(36).substring(7);
  return str;
};

const containsEmail = function(email) {
  for (user in users) {
    if (email === users[user].email) {
      return true
    }
  }
  return false;
};

const findUserFromEmail = email => {
  for (user in users) {
    if (users[user].email === email) {
      return user;
    }
  }
};

const urlsForUser = function(id) {
  const filtered ={};
  for (const shortUrl in urlDatabase) {
    if (userID === urlDatabase[shortUrl].userID) {
      filtered[shortUrl] = urlDatabase[shortUrl].longURL;
    }
  }
  return filtered;
};

module.exports = {generateRandomString, containsEmail, findUserFromEmail, urlsForUser}