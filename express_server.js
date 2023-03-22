const express = require("express");
const app = express();
var cookieParser = require('cookie-parser')
const PORT = 8080; // default port 8080

//This tells the Express app to use EJS as its templating engine
app.set("view engine", "ejs")

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  aK2dw2: {
    id: "aK2dw2",
    name: 'ang',
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  d3v32w: {
    id: "d3v32w",
    name: 'toot',
    email: "user2@example.com",
    password: "dishwasher-funk",
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
    urls: urlDatabase,
    userID: id === undefined ? null : req.cookies[id],
    name: id === undefined ? null : users[id].name
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const id = req.cookies["userID"];
  const templateVars = {
    userID: id,
    name: users[id].name
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const id = req.cookies["userID"];
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    userID: id,
    name: users[id].name
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  console.log(longURL);
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  let urlId = generateRandomString();
  urlDatabase[urlId] = req.body.longURL;
  res.redirect(`urls/${urlId}`);
});

app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls")
});

app.post('/urls/:id', (req, res) => {
  let urlId = req.params.id;
  urlDatabase[urlId] = req.body.newLongURL;
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
  const templateVars = {
    userID: null,
    name : null,
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
    res.status(403).send('Sorry an account already exist')
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

