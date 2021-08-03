
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");




const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
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

//EDIT BUTTON DIRECTS TO EDIT URL PAGE

// app.post('/urls/:id/edit', (req, res) => {
//   const urlId = req.params.id;

//   // const templateVars = {longURL: urlDatabase[urlId]}

//   // res.render('urls_show', templateVars)

//   res.redirect(`/urls/${urlId}`);
// })

//UPDATE URL IN DATABASE
app.post('/urls/:shortURL', (req, res) => {
  //extract id from params
  const urlId = req.params.shortURL;

  //extract new longURL value from the form => req.body
  const longURL = req.body.longURL

  //update longURL 
  urlDatabase[urlId] = longURL

  res.redirect(`/urls/${urlId}`);
})


//function that generates random shortURL id
function generateRandomString() {
  let generated = [];
  let stringy = 'abcdefghijklmnopqrtuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let joined = stringy.split('')
  // console.log(random)
  for (let i = 0; i < 6; i++) {
    let random = joined[Math.floor(Math.random() * joined.length)];
    generated.push(random)
  }
  return generated.join('')
}


