const express = require('express')
const app = express()
const cookieParser = require('cookie-parser')
const PORT = 3000

app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

function generateRandomString() {
  const charset = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let randomString = '';

  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    randomString += charset[randomIndex];
  }

  return randomString;
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
}

const users = {
  userRandomId: {
    id: 'userRandomID', 
    email: 'user@example.com',
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: 'dishwasher-funk',
  },
}

const hasEmailAlready = (email) => {
  for (const userId in users) {
  if (users[userId].email === email) {
    return users[userId]
  } 
}
return null
}

const passwordMatches = (password)  => {
  for (const userId in users) {
    if (users[userId].password === password) {
      return true 
    } 
  }
  return false
}


// ||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||

app.post('/login', (req, res) => {
  const emailTaken = hasEmailAlready(req.body.email)

  if (!hasEmailAlready(req.body.email)) {
    return res.status(403).send('email not found, sorry')
  } else if (!passwordMatches(req.body.password)) {
    return res.status(403).send('password does not match')
  }

  res.cookie('user_id', hasEmailAlready(req.body.email))
  res.redirect('/urls')
})

app.post('/register', (req, res) => {
  const randomUserID = generateRandomString()
  const emailTaken = hasEmailAlready(req.body.email)
  users[randomUserID] = {
    id: randomUserID,
    email: req.body.email,
    password: req.body.password,
  }

  if (req.body.email === "" || req.body.password === "") {
     return res.status(400).send('email or pass cannot be empty')
  } else if (emailTaken !== null) {
    console.log(users)
    return res.status(400).send('email is taken already, sorry')
  }

  res.cookie('user_id', users[randomUserID] )
  console.log(users)
  res.redirect('/urls')
})

app.post('/logout', (req, res) => {
  res.clearCookie('user_id')
  res.redirect('/login')
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

//________________________________________________________________

app.get('/login', (req, res) => {
  const templateVars = { 
    user: req.cookies.user_id
  }
  res.render('login', templateVars)
})

app.get('/register', (req, res) => {
  const templateVars = {
    user: req.cookies.user_id
  }
  res.render('register', templateVars)
})


app.get("/urls/new", (req, res) => {
  const templateVars = { 
    user: req.cookies.user_id
  }
  res.render("urls_new", templateVars);
});

app.get('/urls/:id', (req, res) => {
  const id = req.params.id
  const templateVars = { 
    id: id, 
    longURL: urlDatabase[id],
    user: req.cookies.user_id
  }
  res.render('urls_show', templateVars)
  
});

app.get('/urls', (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    user: req.cookies.user_id
  };  
  res.render('urls_index', templateVars)
})

app.get('/u/:id', (req, res) => {
  const longURL = urlDatabase[req.params.id]
  res.redirect(longURL)
})


app.listen(PORT, () => {
  console.log(`example app listening on port ${PORT}`)
  console.log('FOLLOW THE WHITE RABBIT')
})