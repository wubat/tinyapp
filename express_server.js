const express = require('express')
const app = express()
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

app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id]
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
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars)
})

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get('/urls/:id', (req, res) => {
  const id = req.params.id
  const templateVars = { id: id, longURL: urlDatabase[id] }
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