
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

let cookie_parser=require('cookie-parser')

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookie_parser());
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls/new", (req, res) => {
  const templateVars = { 
    username: req.cookies["username"],
  };
  res.render("urls_new", templateVars);
});

app.get('/urls', (req, res) => {
  console.log(req.cookies.username)
  const templateVars = { 
    username: req.cookies["username"],
    urls: urlDatabase 
  };
  res.render('urls_index', templateVars);
});

//create url redirects to urls?

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    username: req.cookies["username"], 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL] 
  };
  res.render("urls_show", templateVars);
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

app.post("/urls", (req, res) => {
  const shortUrl = generateRandomString()
  urlDatabase[shortUrl] = req.body.longURL
  res.redirect(`/urls/${shortUrl}`);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

// DELETE A URL

app.post('/urls/:shortURL/delete', (req, res) => {
  //extract the id
  const urlId = req.params.shortURL;
  //delete it from database
  delete urlDatabase[urlId];
  //redirect to get quotes
  res.redirect('/urls');
})

//UPDATE URL IN DATABASE

app.post('/urls/:shortURL', (req, res) => {
  //extract id from params
  const urlId = req.params.shortURL;

  //extract new longURL value from the form => req.body
  const longURL = req.body.longURL

  //update longURL 
  urlDatabase[urlId] = longURL

  //redirects to the same page with updated url
  res.redirect(`/urls/${urlId}`);
})

app.post('/login', (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/urls');
})

app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
})

// app.post('/login', (req, res) => {
//   const templateVars = {
//     username: req.cookies["username"],
//     // ... any other vars
//   };
//   res.render("urls_index", templateVars);
//   res.render("urls_new", templateVars);
//   res.render("urls_show", templateVars);
// })


//function that generates random shortURL id
function generateRandomString() {
  let generated = [];
  let stringy = 'abcdefghijklmnopqrtuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let joined = stringy.split('')
  for (let i = 0; i < 6; i++) {
    let random = joined[Math.floor(Math.random() * joined.length)];
    generated.push(random)
  }
  return generated.join('')
}


