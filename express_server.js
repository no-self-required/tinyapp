const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookie_parser=require('cookie-parser')
const {createNewUser, findUser, checkLogin, urlsForUser} = require("./helpers/helpers")

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookie_parser());

app.set("view engine", "ejs");

const urlDatabase = {
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "user1randomid"
  }, 
  '9sm5xK': {
    longURL: "http://www.google.com",
    userID: "user1randomid"
  } 
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

// app.get("/", (req, res) => {
//   res.send("Hello!");
// });

//check if user_id cookies

app.get("/urls/new", (req, res) => {
  let userCookie = req.cookies["user_id"]
  
  if(!userCookie) {
    res.redirect('/login') //res status send (<html>) fix later instead of noLogin ejs page
  }
  const templateVars = { 
    user: userDatabase[req.cookies.user_id],
  };
  res.render("urls_new", templateVars);
});

app.get('/urls', (req, res) => {
  let userCookie = req.cookies["user_id"]
  if(!userCookie) {
    res.redirect('/noLogin')
  }
  //compare urlDatabase ids with userIds < <<
  let urlsToShow = urlsForUser(urlDatabase, userCookie)
  const templateVars = { 
    user: userDatabase[userCookie],
    //*** 
    urls: urlsToShow
  };
  res.render('urls_index', templateVars);
});

app.post("/urls", (req, res) => {
  //^^^
  //"Only Registered Users Can Shorten URLs" curl command
  let idCheck = findUser(userDatabase, req.cookies.user_email)
  if (idCheck === false) {
    res.status(403).send("You must log in to access");
  }
  const shortUrl = generateRandomString()
  // **** //
  urlDatabase[shortUrl] = {
    longURL: req.body.longURL,
    userID: req.cookies["user_id"]
  }
  res.redirect(`/urls/${shortUrl}`);
});

app.get("/noLogin", (req, res) => {
  const templateVars = {
    user: userDatabase[req.cookies.user_id],
  };
  res.render('noLogin', templateVars)
});

app.get("/urls/:shortURL", (req, res) => {
  let userCookie = req.cookies["user_id"]
  if(!userCookie) {
    res.redirect('/noLogin')
  }
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    res.status(404).send("This short URL does not exist");
  }
  const templateVars = {
    user: userDatabase[req.cookies.user_id],
    shortURL: shortURL, 
    longURL: urlDatabase[shortURL].longURL
  };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/u/:shortURL", (req, res) => {
  let userCookie = req.cookies["user_id"]
  if(!userCookie) {
    res.redirect('/noLogin')
  }
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    res.status(404).send("This short URL does not exist");
  }
  res.redirect(urlDatabase[shortURL]);
});

// DELETE A URL
// >>>>>>   how to check if shortURL is owned by loggin in user //if urlId = ???
app.post('/urls/:shortURL/delete', (req, res) => {
  let userCookie = req.cookies["user_id"]
  //extract the id
  const urlId = req.params.shortURL;
  if (urlDatabase[urlId].userID === userCookie) {
    //delete it from database
    delete urlDatabase[urlId];
    //redirect to get quotes
  }
  res.redirect('/urls');
})

//UPDATE URL IN DATABASE
//>>>>>>
app.post('/urls/:shortURL', (req, res) => {
  let userCookie = req.cookies["user_id"]
  if(!userCookie) {
    res.redirect('/noLogin')
  }
  //extract id from params
  const urlId = req.params.shortURL;
  //extract new longURL value from the form => req.body
  const longURL = req.body.longURL

  if (urlDatabase[urlId].userID === userCookie) {
    //update longURL 
    urlDatabase[urlId].longURL = longURL
  }
  //redirects to the same page with updated url
  res.redirect(`/urls/${urlId}`);
})

app.post('/login', (req, res) => { 
  let userID = checkLogin(userDatabase, req.body.email, req.body.password)
  if (checkLogin(userDatabase, req.body.email, req.body.password)) {
    res.cookie('user_id', userID.id);
    res.cookie('user_email', userID.email);
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
  res.redirect("/register")
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
//Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client. After login
