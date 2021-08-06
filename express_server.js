// Import libraries and global variables
const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const methodOverride = require('method-override');
const bcrypt = require('bcrypt');
const salt = bcrypt.genSaltSync(10);
const {createNewUser, findUser, urlsForUser} = require("./helpers/helpers");

//Middleware
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(cookieSession({
  name: 'session',
  keys: ['b33pb00pb0p', 'sd4!1pd98xz7'],
}));

app.set("view engine", "ejs");

//Databases of urls and users
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

const userDatabase = {
  "rT4yp1": {
    id: "rT4yp1",
    email: "user1@example.com",
    hashedPw: bcrypt.hashSync("yoyoyo", 10)
  },
};

//Listens to given PORT
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//Root directory
app.get("/", (req, res) => {
  let userCookie = req.session["user_id"];
  if (!userCookie) {
    return res.redirect('/login');
  }
  res.redirect('/urls');
});

app.get("/urls/new", (req, res) => {
  let userCookie = req.session["user_id"];
  if (!userCookie) {
    return res.redirect('/login');
  }
  const templateVars = {
    user: userDatabase[req.session.user_id],
  };
  res.render("urls_new", templateVars);
});

app.get('/urls', (req, res) => {
  let userCookie = req.session["user_id"];
  let urlsToShow = urlsForUser(urlDatabase, userCookie);
  const templateVars = {
    user: userDatabase[userCookie],
    urls: urlsToShow,
    error: 'Please log in to view associated URLs'
  };
  res.render('urls_index', templateVars);
});

app.post("/urls", (req, res) => {
  const userCookie = req.session["user_id"];
  const email = userDatabase[userCookie].email;
  const idCheck = findUser(userDatabase, email);
  const shortUrl = generateRandomString();
  
  if (req.body.longURL === '' || !(req.body.longURL).includes('.com')) {
    return res.send("Please enter a valid URL");
  } else if (!(req.body.longURL).includes('http')) {
    req.body.longURL = `http://${req.body.longURL}`;
  } else if (idCheck === false) {
    return res.status(403).send("You must log in to access");
  }

  urlDatabase[shortUrl] = {
    longURL: req.body.longURL,
    userID: req.session["user_id"]
  };

  return res.redirect(`/urls/${shortUrl}`);
});

app.get("/urls/:shortURL", (req, res) => {
  const userCookie = req.session["user_id"];
  const shortURL = req.params.shortURL;

  if (!userCookie) {
    return res.status(403).send("<html><title>No Login</title><body>Please <a href='/login'> login </a> or <a href='/register'>register</a> to view associated URLs</body></html");
  } else if (!urlDatabase[shortURL]) {
    return res.status(404).send("This short URL does not exist");
  } else if (urlDatabase[shortURL].userID !== userCookie) {
    return res.status(403).send("Permission denied");
  }

  const templateVars = {
    user: userDatabase[req.session.user_id],
    shortURL: shortURL,
    longURL: urlDatabase[shortURL].longURL
  };

  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const userCookie = req.session["user_id"];
  const shortURL = req.params.shortURL;

  if (!userCookie) {
    return res.status(403).send("<html><title>No Login</title><body>Please <a href='/login'> login </a> or <a href='/register'>register</a> to view associated URLs</body></html");
  } else if (!urlDatabase[shortURL]) {
    return res.status(404).send("This short URL does not exist");
  }
  res.redirect(urlDatabase[shortURL].longURL);
});

//Deletes URLs
app.post('/urls/:shortURL/delete', (req, res) => {
  let userCookie = req.session["user_id"];
  const urlId = req.params.shortURL;
  if (urlDatabase[urlId].userID !== userCookie) {
    return res.status(403).send("Permission denied");
  } else if (urlDatabase[urlId].userID === userCookie) {
    delete urlDatabase[urlId];
  }
  res.redirect('/urls');
});

//Updates URLs
app.post('/urls/:shortURL', (req, res) => {
  let userCookie = req.session["user_id"];
  const urlId = req.params.shortURL;
  const longURL = req.body.longURL;
  if (!userCookie) {
    return res.status(403).send("<html><title>No Login</title><body>Please <a href='/login'> login </a> or <a href='/register'>register</a> to view associated URLs</body></html");
  } else if (req.body.longURL === '') {
    return res.send("Please enter a valid URL");
  } else if (!(req.body.longURL).includes('http')) {
    req.body.longURL = `http://${req.body.longURL}`;
  } else if (urlDatabase[urlId].userID !== userCookie) {
    return res.status(403).send("Permission denied");
  } else if (urlDatabase[urlId].userID === userCookie) {
    urlDatabase[urlId].longURL = longURL;
  }
  res.redirect('/urls');
});

//Login Requests
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userIDobj = findUser(userDatabase, email);
  const id = userIDobj.id;
  const reqEmail = userIDobj.email;

  if (userIDobj === false || !password) {
    return res.status(403).send("Invalid email or password");
  }

  const pwCheck = bcrypt.compareSync(password, userDatabase[id].hashedPw);

  if (pwCheck) {
    req.session.user_id = id;
    req.session.user_email = reqEmail;
    return res.redirect('/urls');
  }
  return res.status(403).send("Invalid email or password");
});

app.get('/login', (req, res) => {
  let userCookie = req.session["user_id"];
  if (userCookie) {
    return res.redirect('/urls');
  }
  const templateVars = {
    user: userDatabase[req.session.user_id],
    email: req.body.email,
    password: req.body.password
  };
  res.render('login', templateVars);
});

app.post('/logout', (req, res) => {
  req.session = null;
  return res.redirect('/urls');
});

//Register requests
app.get('/register', (req, res) => {
  let userCookie = req.session["user_id"];
  if (userCookie) {
    return res.redirect('/urls');
  }
  const templateVars = {
    user: userDatabase[req.session.user_id]
  };
  res.render('register', templateVars);
});

app.post('/register', (req, res) => {
  const hash = bcrypt.hashSync(req.body.password, salt);
  
  if (req.body.email === '' || req.body.password === '') {
    return res.status(400).send("Cannot leave email or password empty");
  } else if (findUser(userDatabase, req.body.email)) {
    return res.status(400).send("Email in use");
  }

  const userObject = {
    id: generateRandomString(),
    email: req.body.email,
    hashedPw: hash
  };

  const userObj = createNewUser(userDatabase, userObject);
  const userID = userObj.id;

  if (userObj) {
    userDatabase[userID] = userObj;
    req.session.user_id = userID;
    return res.redirect('/urls');
  }
  res.redirect("/register");
});

//Random string generation for shortIDs and UserIDs
function generateRandomString() {
  let generated = [];
  let stringy = 'abcdefghijklmnopqrtuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let joined = stringy.split('');
  for (let i = 0; i < 6; i++) {
    let random = joined[Math.floor(Math.random() * joined.length)];
    generated.push(random);
  }
  return generated.join('');
}


