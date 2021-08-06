const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session')
const methodOverride = require('method-override');
const bcrypt = require('bcrypt');
const salt = bcrypt.genSaltSync(10)
const {createNewUser, findUser, urlsForUser} = require("./helpers/helpers")

app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(cookieSession({
  name: 'session',
  keys: ['b33pb00pb0p', 'sd4!1pd98xz7'],
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

const userDatabase = {
  "rT4yp1": {
    id: "rT4yp1",
    email: "user1@example.com",
    hashedPw: bcrypt.hashSync("yoyoyo", 10)
  },
};

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls/new", (req, res) => {
  let userCookie = req.session["user_id"]
  
  if(!userCookie) {
    res.redirect('/login')
    return
  }
  const templateVars = { 
    user: userDatabase[req.session.user_id],
  };
  res.render("urls_new", templateVars);
});

app.get('/urls', (req, res) => {
  let userCookie = req.session["user_id"]
  if(!userCookie) {
    return res.status(403).send("<html><title>No Login</title><body>Please <a href='/login'> Login </a> or <a href='/register'>register</a> to view associated URLs</body></html")
  }
  let urlsToShow = urlsForUser(urlDatabase, userCookie)
  const templateVars = { 
    user: userDatabase[userCookie],
    urls: urlsToShow
  };
  res.render('urls_index', templateVars);
});

// If the user is logged in but does not own the URL with the given id the app should return HTML with a relevant error message.
//^^ must implement still 

app.post("/urls", (req, res) => {
  if (req.body.longURL === '') {
    res.send("Please enter a valid URL")
  }

  if (!(req.body.longURL).includes('http')) {
    req.body.longURL = 'http://' + req.body.longURL;
  }

  let idCheck = findUser(userDatabase, req.session.user_email)
  if (idCheck === false) {
    res.status(403).send("You must log in to access");
    return
  }
  const shortUrl = generateRandomString()
  urlDatabase[shortUrl] = {
    longURL: req.body.longURL,
    userID: req.session["user_id"]
  }
  res.redirect(`/urls/${shortUrl}`);
  return
});

app.get("/urls/:shortURL", (req, res) => {
  let userCookie = req.session["user_id"]
  if(!userCookie) {
    return res.status(403).send("<html><title>No Login</title><body>Please <a href='/login'> login </a> or <a href='/register'>register</a> to view associated URLs</body></html")
  }
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    res.status(404).send("This short URL does not exist");
    return
  }
  const templateVars = {
    user: userDatabase[req.session.user_id],
    shortURL: shortURL, 
    longURL: urlDatabase[shortURL].longURL
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let userCookie = req.session["user_id"]
  if(!userCookie) {
    return res.status(403).send("<html><title>No Login</title><body>Please <a href='/login'> login </a> or <a href='/register'>register</a> to view associated URLs</body></html")
  }
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    res.status(404).send("This short URL does not exist");
  }
  res.redirect(urlDatabase[shortURL]);
});

// DELETE A URL

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

app.post('/urls/:shortURL', (req, res) => {
  let userCookie = req.session["user_id"]
  if(!userCookie) {
    return res.status(403).send("<html><title>No Login</title><body>Please <a href='/login'> login </a> or <a href='/register'>register</a> to view associated URLs</body></html")
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
  res.redirect('/urls');
})

app.post('/login', (req, res) => { 
  const email = req.body.email;
  const password = req.body.password

  let userIDobj = findUser(userDatabase, email);
  if (userIDobj === false || !password) {
    res.status(403).send("Invalid email or password");
    return
  }

  let id = userIDobj.id
  let reqEmail = userIDobj.email

  let pwCheck = bcrypt.compareSync(password, userDatabase[id].hashedPw)
  if (pwCheck) {
    req.session.user_id = id;
    req.session.user_email = reqEmail
    res.redirect('/urls');
    return
  }
  res.send("Invalid email or password").sendStatus(403)
})

app.get('/login', (req, res) => {
  const templateVars = {
    user: userDatabase[req.session.user_id],
    email: req.body.email,
    password: req.body.password
  }
  res.render('login', templateVars)
})

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
  return
})

app.get('/register', (req, res) => {
  let userCookie = req.session["user_id"]
  if(userCookie) {
    res.redirect('/urls')
    return
  }
  const templateVars = {
    user: userDatabase[req.session.user_id]
  }
  res.render('register', templateVars)
})

app.post('/register', (req, res) => {
  if (req.body.email === '' || req.body.password === '') {
    res.status(400).send("Cannot leave email or password empty");
    return
  }
  else if (findUser(userDatabase, req.body.email)) {
    res.status(400).send("Email in use");
    return
  }

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
    return
  }
  res.redirect("/register")
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

//GET /urls/:id
//if user is logged it but does not own the URL with the given ID: returns HTML with a relevant error message


