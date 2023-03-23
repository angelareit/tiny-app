const express = require("express");
const app = express();
var cookieParser = require('cookie-parser')
const PORT = 8080; // default port 8080

//This tells the Express app to use EJS as its templating engine
app.set("view engine", "ejs")

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "dw345w",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "dw345w",
  },
};
const users = {
  aK2dw2: {
    id: "aK2dw2",
    name: 'ang',
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  rsv3qw: {
    id: "rsv3qw",
    name: 'toot',
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
  dw345w: {
    id: "dw345w",
    name: 'toot',
    email: "user@one.com",
    password: "asd",
  },
};

//must add this middleware for the request.body to contain form value
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());



app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const id = req.cookies["userID"];
  const templateVars = {
    urls: urlsForUser(id),
    userID: id === undefined ? null : req.cookies[id],
    name: id === undefined ? null : users[id].name
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const id = req.cookies["userID"];
  if (req.cookies["userID"] === undefined) {
    console.log('Redirecting....');
    res.redirect('/login');
  }
  const templateVars = {
    userID: id,
    name: users[id].name
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  if (urlDatabase[req.params.id].userID !== req.cookies["userID"]) {
    res.status(403).send('Sorry, cannot access other user\'s short URL.')
    return;
  }
  if (req.cookies["userID"] === undefined) {
    res.status(403).send('Sorry, You must be view shorten URLs')
    return;
  }
  const id = req.cookies["userID"];
  console.log('/urls/:id ', req.params.id);
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    userID: id,
    name: users[id].name
  };
  console.log('get urls/:id ', templateVars);
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  if (!urlDatabase.hasOwnProperty(req.params.id)) {
    res.status(403).send('Sorry, shortened id does not exist')
  }
  if (req.cookies["userID"] === undefined || urlDatabase[req.params.id].userID !== req.cookies["userID"]) {
    res.status(403).send('Sorry, cannot access other user\'s short URL.')
    return;
  }
  const longURL = urlDatabase[req.params.id].longURL;
  console.log(longURL);
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  if (req.cookies["userID"] === undefined) {
    res.status(403).send('Sorry, You must be logged in to shorten URLs')
    return;
  }
  let urlId = generateRandomString();
  console.log('post /urls: ', req.body.longURL);
  urlDatabase[urlId] = {
    longURL: req.body.longURL,
    userID: req.cookies["userID"]
  };

  console.log('post /urls: ', urlDatabase[urlId])
  res.redirect(`urls/${urlId}`);
});

app.post('/urls/:id/delete', (req, res) => {
  if (urlDatabase[req.params.id].userID !== req.cookies["userID"]) {
    res.status(403).send('Sorry, cannot delete other user\'s short URL.')
    return;
  }
  delete urlDatabase[req.params.id];
  res.redirect("/urls")
});

app.post('/urls/:id', (req, res) => {
  if (urlDatabase[req.params.id].userID !== req.cookies["userID"]) {
    res.status(403).send('Sorry, cannot access other user\'s short URL.')
    return;
  }
  let urlId = req.params.id;
  urlDatabase[urlId] = {
    longURL: req.body.newLongURL,
    userID: req.cookies["userID"]
  };
  console.log(urlDatabase);
  res.redirect(`/urls/${urlId}`);
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  // console.log('LOGIN POST:', email, password, users);
  const currUser = findUserBy(req, 'email');
  // console.log('CURR USER:', currUser);
  if (currUser === undefined) {
    res.status(403).send('Sorry, Account Not Found')
    return;
  }
  if (password !== currUser.password) {
    res.status(403).send('Sorry Invalid Password')
    return;
  }
  res.cookie('userID', currUser.id);
  res.redirect("/urls")
});
app.get('/login', (req, res) => {
  //  console.log('LOGIN:', req.cookies["userID"]);
  if (req.cookies["userID"] !== undefined) {
    console.log('Redirecting....');
    res.redirect('/urls');
  }
  const templateVars = {
    userID: null,
    name: null,
    email: req.body.email,
    password: req.body.password
  };
  res.render("login", templateVars);
});
app.post('/logout', (req, res) => {
  res.clearCookie('userID');
  res.redirect("/login")
});

app.get('/register', (req, res) => {
  if (req.cookies["userID"] !== undefined) {
    console.log('Redirecting....');
    res.redirect('/urls');
  }
  const templateVars = {
    userID: null
  };
  res.render("registration", templateVars);
});

app.post('/register', (req, res) => {
  if (req.body.email === '' || req.body.password === '') {
    res.status(403).send('Sorry Invalid Credentials')
    return;
  }
  if (findUserBy(req, 'email') !== undefined) {
    res.status(403).send('Sorry an account with the same email already exist')
    return;
  }
  const templateVars = {
    id: generateRandomString(),
    name: req.body.name,
    email: req.body.email,
    password: req.body.password
  };
  users[templateVars.id] = templateVars;
  res.cookie('userID', templateVars.id);
  console.log(users);
  res.redirect(`/urls`);
});

function generateRandomString() {
  let randomStr = Math.random().toString(36).slice(2, 8);
  return randomStr;
}

//find users by an object value.  Input (request, objectKey)
function findUserBy(req, val) {
  for (let x in users) {
    if (users[x][val] === req.body[val]) {
      return users[x];
    }
  }
  return undefined;
}

function urlsForUser(userID) {
  const myUrls = {};
  for (let x in urlDatabase) {
    if (urlDatabase[x].userID === userID) {
      myUrls[x] = urlDatabase[x];
    }
  }
  return myUrls;
}




