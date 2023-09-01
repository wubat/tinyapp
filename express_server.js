const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const PORT = 3000;
const cookieSession = require('cookie-session');
const getUserByEmail = require('./helpers.js');

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['yomama']
}));

function generateRandomString() {
  const charset = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let randomString = '';

  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    randomString += charset[randomIndex];
  }

  return randomString;
};

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },

};

const users = {
  userRandomId: {
    id: 'userRandomID', 
    email: 'user@example.com',
    password: "asdf",
  },
  user2RandomID: {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: 'dishwasher-funk',
  },
};



      
const hasEmailAlready = (email) => {
  for (const userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return null
};
      
const userLoggedIn = () => {
  if (req.cookies.user_id) {
    return true;
  }
  return false  ;
};

const userOwnsUrl = (linkId) => {
  for ( urlId in urlDatabase) {
    if (urlId === linkId) {
      return true;
    }
  }
  return false ;
};


// ______________________POST_________________________________________

app.post('/login', (req, res) => {
 
  let databaseUser = getUserByEmail(req.body.email, users);

  if (!hasEmailAlready(req.body.email)) {
    return res.status(403).send('email not found, sorry');
  }
  
  const passwordMatches = bcrypt.compareSync(req.body.password, users[databaseUser].password);
  
  if (!passwordMatches) {
    console.log(req.body.password);
    return res.status(403).send('password does not match');
  }

  req.session.user_id = hasEmailAlready(req.body.email);
  res.redirect('/urls');
});


app.post('/register', (req, res) => {
  const randomUserID = generateRandomString();
  const emailTaken = hasEmailAlready(req.body.email);
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);

  users[randomUserID] = {
    id: randomUserID,
    email: req.body.email,
    password: hashedPassword,
  };

  if (req.body.email === "" || req.body.password === "") {
     return res.status(400).send('email or pass cannot be empty');
  } else if (emailTaken !== null) {
    console.log(users);
    return res.status(400).send('email is taken already, sorry');
  }

  req.session.user_id = users[randomUserID];
  console.log(users);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/login');
});

app.post('/urls/:id/delete', (req, res) => {
  if (!userLoggedIn) {
    return res.send('you are not the logged in, cannot delete');
  }  else if (!userOwnsUrl(req.params.id)){
    return res.send('you are not the owner of the URL, cannot delete');
  } else if (!urlDatabase[req.params.id]) {
    return res.send('url id not found');
  }

  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

app.post('/urls/:id', (req, res) => {
  const shortURL = generateRandomString();

  if (!userLoggedIn) {
    return res.send('you are not the logged in user to the URL, cannot make new URL');
  } else if (!urlDatabase[req.params.id]) {
    return res.send('url id not found');
  } else if (!userOwnsUrl(req.params.id)) {
    return res.send('you are not the owner of the URL, cannot post');
  }

  urlDatabase[shortURL].longURL = req.body.longURL;
  console.log(urlDatabase);
  res.redirect('/urls');
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();

  if (!req.session.user_id) {
    return res.send('you must login to wield the power of shortened links');
  }

  urlDatabase[shortURL].longURL = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
  console.log(urlDatabase); 
  res.send("Ok, it's been submitted"); 
});

//_______________________GET_________________________________

app.get('/login', (req, res) => {

  if (req.session.user_id) {
    return res.redirect('/urls');
  }

  const templateVars = { 
    user: req.session.user_id
  };
  res.render('login', templateVars);
});


app.get('/register', (req, res) => {
  
  if (req.session.user_id) {
    res.redirect('/urls');
  }
  
  const templateVars = {
    user: req.session.user_id
  };
  res.render('register', templateVars);
});


app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    return res.redirect('/login');
  }

  const templateVars = { 
    user: req.session.user_id
  };
  res.render("urls_new", templateVars);
});


app.get('/urls/:id', (req, res) => {
  const templateVars = { 
    id: req.params.id, 
    longURL: urlDatabase[req.params.id].longURL,
    user: req.session.user_id
  };

  if(urlDatabase[urlId].userID !== req.session.user_id) {
    return res.send('you did not create the tinURL, so u cannot see it, sry');
  }

  res.render('urls_show', templateVars);
});


app.get('/urls', (req, res) => {
  const urlsForUser = (id) => {
    const filteredUrls = {};

    for (urlId in urlDatabase) {
      if (urlDatabase[urlId].userID === id) {
        filteredUrls[urlId] = urlDatabase[urlId];
      }
    }  
  };

  const templateVars = { 
    urls: urlsForUser(req.session.user_id),
    user: req.session.user_id
  };  

  if (!req.session.user_id) {
    return res.send('you must login first to see these links');
  }

  res.render('urls_index', templateVars);
});


app.get('/u/:id', (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;

  if (!longURL) {
    return res.send('shortened link is not in database :(');
  }

  res.redirect(longURL);
});


app.listen(PORT, () => {
  console.log(`example app listening on port ${PORT}`);
  console.log('FOLLOW THE WHITE RABBIT');
});