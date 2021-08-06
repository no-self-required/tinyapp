const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");

// const cookie_parser=require('cookie-parser')
const cookieSession = require('cookie-session')

const {createNewUser, findUser, urlsForUser} = require("./helpers/helpers")
const bcrypt = require('bcrypt');

app.use(bodyParser.urlencoded({extended: true}));
// app.use(cookie_parser());

app.use(cookieSession({
  name: 'session',
  keys: ['b33pb00pb0p'],
}))

app.set("view engine", "ejs");

const urlDatabase = {
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "rT4yp1"
  }, 
  '9sm5xK': {
    longURL: "http://www.google.com",
    userID: "rT4yp1"
  } 
};

const pass1 = "yoyoyo";
const hash = bcrypt.hashSync(pass1, 10);

const userDatabase = {
  "rT4yp1": {
    id: "rT4yp1",
    email: "user1@example.com",
    hashedPw: hash
  },
};

// app.get("/", (req, res) => {
//   res.send("Hello!");
// });

//check if user_id cookies

app.get("/urls/new", (req, res) => {
  let userCookie = req.session["user_id"]
  
  if(!userCookie) {
    res.redirect('/login') //res status send (<html>) fix later instead of noLogin ejs page
  }
  const templateVars = { 
    user: userDatabase[req.session.user_id],
  };
  res.render("urls_new", templateVars);
});

app.get('/urls', (req, res) => {
  let userCookie = req.session["user_id"]
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

// If the user is logged in but does not own the URL with the given id the app should return HTML with a relevant error message.
//^^ must implement still 
app.post("/urls", (req, res) => {
  //^^^
  //"Only Registered Users Can Shorten URLs" curl command

  let idCheck = findUser(userDatabase, req.session.user_email)
  if (idCheck === false) {
    res.status(403).send("You must log in to access");
  }
  const shortUrl = generateRandomString()
  // **** //
  urlDatabase[shortUrl] = {
    longURL: req.body.longURL,
    userID: req.session["user_id"]
  }
  res.redirect(`/urls/${shortUrl}`);
});

app.get("/noLogin", (req, res) => {
  const templateVars = {
    user: userDatabase[req.session.user_id],
  };
  res.render('noLogin', templateVars)
});

app.get("/urls/:shortURL", (req, res) => {
  let userCookie = req.session["user_id"]
  if(!userCookie) {
    res.redirect('/noLogin')
  }
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    res.status(404).send("This short URL does not exist");
  }
  const templateVars = {
    user: userDatabase[req.session.user_id],
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
  let userCookie = req.session["user_id"]
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
  let userCookie = req.session["user_id"]
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
  let userCookie = req.session["user_id"]
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
  const email = req.body.email;
  const password = req.body.password

  let userIDobj = findUser(userDatabase, email);
  if (!userIDobj) {
    res.status(403).send("Invalid email or password");
  }
  let id = userIDobj.id
  let reqEmail = userIDobj.email
  console.log('CHECK: ', userDatabase[id].hashedPw)
  let pwCheck = bcrypt.compareSync(password, userDatabase[id].hashedPw)
  if (pwCheck) {
    // res.cookie('user_id', id);
    req.session.user_id = id;
    req.session.user_email = reqEmail
    res.redirect('/urls');
  }
  res.status(403).send("Invalid email or password");
  return
})

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
})

app.get('/register', (req, res) => {
  const templateVars = {
    user: userDatabase[req.session.user_id]
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

  const salt = bcrypt.genSaltSync(10)
  const hash = bcrypt.hashSync(req.body.password, salt);

  const userObject = {
    id: generateRandomString(),
    email: req.body.email,
    hashedPw: hash
  }

  const userObj = createNewUser(userDatabase, userObject)
  let userID = userObj.id;

  if (userObj) {
    userDatabase[userID] = userObj
    req.session.user_id = userID;
    res.redirect('/urls')
  }
  res.redirect("/register")
})

//password? should be hashedPw??
app.get('/login', (req, res) => {
  const templateVars = {
    user: userDatabase[req.session.user_id],
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
// LINE 70


//Create new url: catch edge cases like: empty url, no http://
//ShortURL hyperlink: should go to longurl site?