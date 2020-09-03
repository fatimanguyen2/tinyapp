const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session')
const {generateRandomString, containsEmail, findUserFromEmail, urlsForUser} = require('./helpers/helper_functions');
const bcrypt = require('bcrypt')

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

app.get('/urls', (req, res) => {
  const user_id = req.session.user_id;
  const urls = urlsForUser(user_id, urlDatabase);
  const user = users[user_id];
  const templateVars = {urls, user};
  res.render('urls_index', templateVars);
});

app.post("/urls", (req, res) => {
  const newShortURL = generateRandomString();
  const longURL = req.body.longURL;
  const user_id = req.session.user_id;
  urlDatabase[newShortURL] = {longURL, user_id};
  res.redirect(`/urls/${newShortURL}`);
});

app.get('/urls/new', (req, res) => {
  const user_id = req.session.user_id;
  const user = users[user_id];
  const templateVars = {user};

  if (!user_id) {
    res.redirect('/login');
  } else {
    res.render('urls_new', templateVars);
  }
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL] && urlDatabase[shortURL].longURL;

  if (longURL.startsWith('http')) {
    res.redirect(longURL);
  } else {
    res.redirect('http://' + longURL);
  }
});

app.get('/urls/:shortURL', (req, res) => {
  const user_id = req.session.user_id;
  const filteredUrls = urlsForUser(user_id, urlDatabase);
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL] && urlDatabase[shortURL].longURL;
  const user = users[user_id];
  const templateVars = {shortURL, longURL, user};
  if (!user_id || Object.keys(filteredUrls).length === 0) {
    res.send('Please register or log in');
  } else {
    res.render('urls_show', templateVars);
  }
});

app.get('/register', (req, res) => {
  const user = users[req.session.user_id];
  const templateVars = {user};

  res.render('registration', templateVars);
});

app.get('/login', (req, res) => {
  const user = users[req.session.user_id];
  const templateVars = {user};

  res.render('login', templateVars);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const filteredUrls = urlsForUser(req.session.user_id, urlDatabase);
  const shortURL = req.params.shortURL;

  if (filteredUrls[shortURL]) {
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  } else {
    res.sendStatus(403);
  }
});

app.post('/urls/:shortURL/update', (req, res) => {
  const filteredUrls = urlsForUser(req.session.user_id, urlDatabase);
  const shortURL = req.params.shortURL;

  if (filteredUrls[shortURL]) {
    urlDatabase[shortURL].longURL = req.body.updatedLongURL;
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.sendStatus(403);
  }
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const givenPassword = req.body.password;
  const user_id = findUserFromEmail(email, users);
  const databasePassword = user_id ? users[user_id].password : null;
  if (!containsEmail(email, users) || !bcrypt.compareSync(givenPassword, databasePassword)) {
    res.sendStatus(403);
  } else {
    req.session.user_id = user_id;
    res.redirect('/urls');
  }
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

app.post('/register', (req, res) => {
  if (!req.body.email || !req.body.password || containsEmail(req.body.email, users)) {
    res.sendStatus(400);
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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});