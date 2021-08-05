const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookie_parser=require('cookie-parser')
const {createNewUser, findUser, findUser2} = require("./helpers/helpers")

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookie_parser());

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const userDatabase = {
  "user1randomid": {
    id: "user1randomid",
    email: "user1@example.com",
    password: "yoyoyo"
  },
  "user2randomid": {
    id: "user2randomid",
    email: "user2@example.com",
    password: "y0y0y0y0"
  }
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls/new", (req, res) => {
  const templateVars = { 
    user: userDatabase[req.cookies.user_id],
  };
  res.render("urls_new", templateVars);
});

app.get('/urls', (req, res) => {
  const templateVars = { 
    user: userDatabase[req.cookies.user_id],
    urls: urlDatabase 
  };
  res.render('urls_index', templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    user: user ? user : null,
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
  let userID = findUser2(userDatabase, req.body.email, req.body.password)
  if (findUser2(userDatabase, req.body.email, req.body.password)) {
    res.cookie('user_id', userID.id);
    res.redirect('/urls');
  }
  res.status(403).send("Invalid email or password");
})

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
})

app.get('/register', (req, res) => {
  const templateVars = {
    user: userDatabase[req.cookies.user_id]
  }
  res.render('register', templateVars)
})

app.post('/register', (req, res) => {
  if (req.body.email === '' || req.body.password === '') {
    res.status(400).send("Cannot leave email or password empty");
  }
  else if (findUser(userDatabase, req.body.email)) {
    res.status(400).send("Email in use");
  }
  const userObject = {
    id: generateRandomString(),
    email: req.body.email,
    password: req.body.password
  }

  const user = createNewUser(userDatabase, userObject)
  if (user) {
    res.cookie("user_id", user.id)
    res.redirect('/urls')
  }

  // res.redirect("/register")
})

app.get('/login', (req, res) => {
  const templateVars = {
    user: userDatabase[req.cookies.user_id],
    email: req.body.email,
    password: req.body.password
  }
  res.render('login', templateVars)
})


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


//need to make log in and register button disappear after log in
//Style fonts/buttons and format login/register templates