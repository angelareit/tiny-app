const express = require("express");
const app = express();
const bcrypt = require("bcryptjs");
var cookieSession = require('cookie-session')
const {getUserByEmail}  = require('./helpers');

const PORT = 8080; // default port 8080

//This tells the Express app to use EJS as its templating engine
app.set("view engine", "ejs")

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aK2dw2",
    dateCreated: '000'
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aK2dw2",
    dateCreated: '000'
  },
};
const users = {
  aK2dw2: {
    id: "aK2dw2",
    name: 'Bob',
    email: "user@example.com",
    password: "$2a$10$F.FXqbHuzox270dCNnC0buhzq2GCyfeOOi9Tsp3YAuEBmiXaRc//S",
  },
};

//must add this middleware for the request.body to contain form value
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['userID'],
}));


app.get("/", (req, res) => {
  res.redirect('/urls');
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
  const id = req.session.userID;
  const templateVars = {
    urls: urlsForUser(id),
    userID: !id  ? null : req.session.id,
    name: !id ? null : users[id].name
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const id = req.session.userID;
  if (req.session.userID === undefined) {
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
  const id = req.session.userID;

  if (urlDatabase[req.params.id].userID !== id) {
    res.status(403).send('Sorry, cannot access other user\'s short URL.')
    return;
  }
  if (!id) {
    res.status(403).send('Sorry, You must be view shorten URLs')
    return;
  }

  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    userID: id,
    name: users[id].name,
    dateCreated: urlDatabase[req.params.id].dateCreated
  };

  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  if (!urlDatabase.hasOwnProperty(req.params.id)) {
    res.status(403).send('Sorry, shortened id does not exist')
  }
  if (!req.session.userID || urlDatabase[req.params.id].userID !== req.session.userID) {
    res.status(403).send('Sorry, cannot access other user\'s short URL.')
    return;
  }
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  const userID= req.session.userID;
  const date = new Date().toLocaleString().replace(",","").replace(/:.. /," ") + ' UTC';

  if (!userID) {
    res.status(403).send('Sorry, You must be logged in to shorten URLs')
    return;
  }

  let urlId = generateRandomString();
  urlDatabase[urlId] = {
    longURL: req.body.longURL,
    userID,
    dateCreated: date
  };

  res.redirect(`urls/${urlId}`);
});

app.post('/urls/:id/delete', (req, res) => {
  if (urlDatabase[req.params.id].userID !== req.session.userID) {
    res.status(403).send('Sorry, cannot delete other user\'s short URL.')
    return;
  }
  delete urlDatabase[req.params.id];
  res.redirect("/urls")
});

app.post('/urls/:id', (req, res) => {
  let urlId = req.params.id;
  const date = new Date().toLocaleString().replace(",","").replace(/:.. /," ") + ' UTC';

  if (urlDatabase[urlId].userID !== req.session.userID) {
    res.status(403).send('Sorry, cannot access other user\'s short URL.')
    return;
  }
  urlDatabase[urlId] = {
    longURL: req.body.newLongURL,
    userID: req.session.userID,
    dateCreated: date
  };
  res.redirect(`/urls/${urlId}`);
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const currUser = findUserBy(req, 'email');

  if(!getUserByEmail(email, users))
  {
    res.status(403).send('Sorry, Account Not Found')
    return;
  }

  if (bcrypt.hashSync(password) === currUser.password)
    {
    res.status(403).send('Sorry Invalid Password')
    return;
  }

  req.session.userID = currUser.id;
  res.redirect("/urls")
});

app.get('/login', (req, res) => {
  if (req.session.userID !== undefined) {
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
  req.session = null;
  res.redirect("/login")
});

app.get('/register', (req, res) => {
  if (req.session.userID !== undefined) {
    console.log('Redirecting....');
    res.redirect('/urls');
  }
  const templateVars = {
    userID: null
  };
  res.render("registration", templateVars);
});

app.post('/register', (req, res) => {
  const {email,password, name} = req.body;

  if (!email || !password) {
    res.status(403).send('Sorry Invalid Credentials')
    return;
  }
  const userFound=getUserByEmail(email, users); 
  if (userFound) {
    res.status(403).send('Sorry an account with the same email already exist')
    return;
  }

  const hashedPass = bcrypt.hashSync(req.body.password, 10);
  const templateVars = {
    id: generateRandomString(),
    name: req.body.name,
    email: req.body.email,
    password: hashedPass
  };
  users[templateVars.id] = templateVars;
  req.session.userID= templateVars.id;
  res.redirect(`/urls`);
});


//generates 6 character random string, used for generating UserId and shortURL
function generateRandomString() {
  let randomStr = Math.random().toString(36).slice(2, 8);
  return randomStr;
}

//find users by an object value.  Input (request, objectKey, database to look for)
function findUserBy(req, val, database = users) {
  for (let x in users) {
    if (users[x][val] === req.body[val]) {
      return users[x];
    }
  }
  return undefined;
}

//returns all the saved urls made by the user. Input (userID)
function urlsForUser(userID) {
  const myUrls = {};
  for (let x in urlDatabase) {
    if (urlDatabase[x].userID === userID) {
      myUrls[x] = urlDatabase[x];
    }
  }
  return myUrls;
}




