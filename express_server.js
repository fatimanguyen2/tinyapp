const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require('cookie-parser');
app.use(cookieParser());
app.set('view engine', 'ejs');

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.lighthouselabs.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};
// users[user] = {
//   id: user,
//   email: req.body.email,
//   password: req.body.password
// };
const users = {};

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

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get('/urls.json', (req , res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.get('/urls', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies['user_id']]
  };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  const templateVars = {
    user: users[req.cookies['user_id']]
  };
  if (!req.cookies) {
    console.log(req.cookies)
    res.redirect('/login')
  } else {
    console.log('woof')
    res.render('urls_new', templateVars);
  }
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  console.log(longURL)
  if (longURL.startsWith('http://')) {
    res.redirect(longURL);
  } else {
    res.redirect('http://' + longURL);
  }
});

app.get('/urls/:shortURL', (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.cookies['user_id']]
  };
  res.render('urls_show', templateVars);
});

app.get('/register', (req, res) => {
  const templateVars = {
    user: users[req.cookies['user_id']]
  };
  res.render('registration', templateVars);
});

app.get('/login', (req, res) => {
  const templateVars = {
    user: users[req.cookies['user_id']]
  };
  res.render('login', templateVars);
});


app.post("/urls", (req, res) => {
  const newShortURL = generateRandomString();
  urlDatabase[newShortURL] = req.body.longURL;
  res.redirect(`/urls/${newShortURL}`);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

app.post('/urls/:shortURL/update', (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.updatedLongURL;
  res.redirect(`/urls/${req.params.shortURL}`);
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!containsEmail(email) || password !== users[findUserFromEmail(email)].password) {
    res.sendStatus(403);
  // } else if (password !== users[findUserFromEmail(email)].password) {
  //   res.sendStatus(403);
  } else {
    res.cookie('user_id', findUserFromEmail(email));
    res.redirect('/urls');
  }
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.post('/register', (req, res) => {
  if (!req.body.email || !req.body.password || containsEmail(req.body.email)) {
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