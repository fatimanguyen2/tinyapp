const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const {generateRandomString, containsEmail, findUserFromEmail, urlsForUser} = require('./helpers/helper_functions');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set('view engine', 'ejs');

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.lighthouselabs.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};
const users = {};

app.get('/urls', (req, res) => {
  const userID = req.cookies['user_id'];
  const urls = urlsForUser(userID, urlDatabase);
  const user = users[userID];
  const templateVars = {urls, user};

  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  const userID = req.cookies['user_id'];
  const user = users[userID];
  const templateVars = {user};

  if (!userID) {
    res.redirect('/login');
  } else {
    res.render('urls_new', templateVars);
  }
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;

  if (longURL.startsWith('http')) {
    res.redirect(longURL);
  } else {
    res.redirect('http://' + longURL);
  }
});

app.get('/urls/:shortURL', (req, res) => {
  const userID = req.cookies['user_id'];
  const filteredUrls = urlsForUser(userID, urlDatabase);
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  const user = users[userID];
  const templateVars = {shortURL, longURL, user};

  if (!userID || Object.keys(filteredUrls).length === 0) {
    res.send('log in');
  } else {
    res.render('urls_show', templateVars);
  }
});

app.get('/register', (req, res) => {
  const user = users[req.cookies['user_id']];
  const templateVars = {user};

  res.render('registration', templateVars);
});

app.get('/login', (req, res) => {
  const user = users[req.cookies['user_id']];
  const templateVars = {user};

  res.render('login', templateVars);
});


app.post("/urls", (req, res) => {
  const newShortURL = generateRandomString();
  const longURL = req.body.longURL;
  const userID = req.cookies['user_id'];

  urlDatabase[newShortURL] = {longURL, userID};
  res.redirect(`/urls/${newShortURL}`);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const filteredUrls = urlsForUser(req.cookies['user_id'], urlDatabase);
  const shortURL = req.params.shortURL;

  if (filteredUrls.hasOwnProperty(shortURL)) {
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  } else {
    res.sendStatus(403);
  }
});

app.post('/urls/:shortURL/update', (req, res) => {
  const filteredUrls = urlsForUser(req.cookies['user_id'], urlDatabase);
  const shortURL = req.params.shortURL;

  if (filteredUrls.hasOwnProperty(shortURL)) {
    urlDatabase[shortURL].longURL = req.body.updatedLongURL;
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.sendStatus(403);
  }
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const givenPassword = req.body.password;
  const databasePassword = users[findUserFromEmail(email, users)].password;

  if (!containsEmail(email, users) || givenPassword !== databasePassword) {
    res.sendStatus(403);
  } else {
    res.cookie('user_id', findUserFromEmail(email, users));
    res.redirect('/urls');
  }
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.post('/register', (req, res) => {
  if (!req.body.email || !req.body.password || containsEmail(req.body.email, users)) {
    res.sendStatus(400);
  } else {
    const user = generateRandomString();
    users[user] = {
      id: user,
      email: req.body.email,
      password: req.body.password
    };
    res.cookie('user_id', user);
    res.redirect('/urls');
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});