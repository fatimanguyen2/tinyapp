const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const {generateRandomString, containsEmail, findUserFromEmail, urlsForUser} = require('./helpers/helpers');
const bcrypt = require('bcrypt');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));
app.set('view engine', 'ejs');

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.lighthouselabs.ca", user_id: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", user_id: "aJ48lW" }
};
const users = {};


app.get('/', (req, res) => {
  const { user_id } = req.session;
  if (user_id) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

app.get('/urls', (req, res) => {
  const { user_id } = req.session;
  const urls = urlsForUser(user_id, urlDatabase);
  const user = users[user_id];
  const templateVars = {urls, user};

  res.render('urls_index', templateVars);
});

app.post("/urls", (req, res) => {
  const newShortURL = generateRandomString();
  const { longURL } = req.body;
  const { user_id } = req.session;

  if (user_id) {
    urlDatabase[newShortURL] = { longURL, user_id };
    res.redirect(`/urls/${newShortURL}`);
  } else {
    res.render('userNotLoggedIn');
  }
});

app.get('/urls/new', (req, res) => {
  const { user_id } = req.session;
  const user = users[user_id];
  const templateVars = { user };

  if (!user_id) {
    res.redirect('/login');
  } else {
    res.render('urls_new', templateVars);
  }
});

app.get("/u/:shortURL", (req, res) => {
  const { user_id } = req.session;
  const filteredUrls = urlsForUser(user_id, urlDatabase);
  const { shortURL } = req.params;
  const longURL = urlDatabase[shortURL] && urlDatabase[shortURL].longURL;
  const templateVars = { user: users[user_id]};

  if (Object.keys(filteredUrls).length !== 0) {
    if (longURL.startsWith('http')) {
      res.redirect(longURL);
    } else {
      res.redirect('http://' + longURL);
    }

  } else {
    res.render('urlDoesNotExist.ejs', templateVars);
  }
});

app.get('/urls/:shortURL', (req, res) => {
  const { user_id } = req.session;
  const filteredUrls = urlsForUser(user_id, urlDatabase);
  const { shortURL } = req.params;
  const longURL = urlDatabase[shortURL] && urlDatabase[shortURL].longURL;
  const user = users[user_id];
  const templateVars = {shortURL, longURL, user};

  if (!user_id) {
    res.render('userNotLoggedIn', templateVars);

  } else if (Object.keys(filteredUrls).length === 0) {
    res.render('urlDoesNotExist', templateVars);

  } else {
    res.render('urls_show', templateVars);
  }
});

app.post('/urls/:shortURL', (req, res) => {
  const { user_id } = req.session;
  const filteredUrls = urlsForUser(req.session.user_id, urlDatabase);
  const { shortURL } = req.params;
  const templateVars = {user: users[user_id]};

  if (user_id) {
    if (filteredUrls[shortURL]) {
      urlDatabase[shortURL].longURL = req.body.updatedLongURL;
      res.redirect(`/urls/${shortURL}`);
    } else {
      res.render('urlDoesNotExist', templateVars);
    }

  } else {
    res.render('userNotLoggedIn', templateVars);
  }
});

app.get('/register', (req, res) => {
  const user = users[req.session.user_id];
  const templateVars = {user};
  
  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    res.render('registration', templateVars);
  }
});

app.post('/register', (req, res) => {
  const templateVars = {user: users[req.session.user_id]};

  if (!req.body.email || !req.body.password) {
    res.render('missingData', templateVars);

  } else if (containsEmail(req.body.email, users)) {
    res.render('duplicateRegistration', templateVars);

  } else {
    const user_id = generateRandomString();
    users[user_id] = {
      id: user_id,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10)
    };

    req.session.user_id = user_id;
    res.redirect('/urls');
  }
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const { user_id } = req.session;
  const filteredUrls = urlsForUser(user_id, urlDatabase);
  const { shortURL } = req.params;
  const templateVars = {user: users[user_id]};
  
  if (user_id) {
    if (filteredUrls[shortURL]) {
      delete urlDatabase[shortURL];
      res.redirect('/urls');
    } else {
      res.render('urlDoesNotExist', templateVars);
    }

  } else {
    res.render('userNotLoggedIn', templateVars);
  }
});

app.get('/login', (req, res) => {
  const { user_id } = req.session;
  const user = users[user_id];
  const templateVars = { user };

  if (user_id) {
    res.redirect('/urls');
  } else {
    res.render('login', templateVars);
  }
});

app.post('/login', (req, res) => {
  const { email } = req.body;
  const { password } = req.body;
  const user_id = findUserFromEmail(email, users);
  const databasePassword = user_id ? users[user_id].password : null;
  const templateVars = {user: users[user_id]};

  if (!containsEmail(email, users) || !bcrypt.compareSync(password, databasePassword)) {
    res.render('userNotLoggedIn.ejs', templateVars);
  } else {
    req.session.user_id = user_id;
    res.redirect('/urls');
  }
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});