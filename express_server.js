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
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"],
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id, 
    longURL: urlDatabase[req.params.id], 
    username: req.cookies["username"],
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  console.log(longURL);
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  let urlId = generateRandomString();
  urlDatabase[urlId] = req.body.longURL;
  //res.send("Ok"); // Respond with 'Ok' (we will replace this)
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
  let inputUsername = req.body.username;
  res.cookie('username', inputUsername);
  res.redirect("/urls")
});

function generateRandomString() {
  let randomStr = Math.random().toString(36).slice(2, 8);
  return randomStr;
}


