const express = require('express')
const app = express()
const cookieParser = require('cookie-parser')
const PORT = 3000

app.set('view engine', 'ejs')


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
}

function generateRandomString() {
  const charset = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let randomString = '';

  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    randomString += charset[randomIndex];
  }

  return randomString;
}

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
//old server test code_______________________________________________________________
// app.get('/', (req, res) => {
//   res.send('hello')
// })

// app.get('/urls.json', (req, res) => {
//   res.json(urlDatabase)
// })

// app.get('/hello', (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n")
// })

// app.get('/login', (req, res) => {
//   const templateVars = {
//     username: req.cookies['username']
//   }
//   res.render('partials/_header', templateVars)
// })

app.post('/login', (req, res) => {
  res.cookie('username', req.body.username)
  res.redirect('/urls')
})

app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id]
  res.redirect('/urls')
})

app.post('/urls/:id', (req, res) => {
  const shortURL = generateRandomString()
  urlDatabase[shortURL] = req.body.longURL
  console.log(urlDatabase)
  res.redirect('/urls')
})

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString()

  urlDatabase[shortURL] = req.body.longURL
  res.redirect(`/urls/${shortURL}`)
  console.log(urlDatabase); // Log the POST request body to the console
  res.send("Ok, it's been submitted"); // Respond with 'Ok' (we will replace this)
});

app.get('/urls', (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    username: req.cookies['username'] 
  };
  res.render('urls_index', templateVars)
})

app.get("/urls/new", (req, res) => {
  const templateVars = { 
    username: req.cookies['username'] 
  }
  res.render("urls_new", templateVars);
});

app.get('/urls/:id', (req, res) => {
  const id = req.params.id
  const templateVars = { 
    id: id, 
    longURL: urlDatabase[id],
    username: req.cookies['username']
   }
  res.render('urls_show', templateVars)
 
});

app.get('/u/:id', (req, res) => {
  const longURL = urlDatabase[req.params.id]
  res.redirect(longURL)
})



app.listen(PORT, () => {
  console.log(`example app listening on port ${PORT}`)
  console.log('FOLLOW THE WHITE RABBIT')
})