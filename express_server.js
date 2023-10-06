const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const PORT = 3000;
const cookieSession = require('cookie-session');
const getUserByEmail = require('./helpers.js');
const { use } = require('chai');
const e = require('express');

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['yomama']
}));

//generates random string for link's short URL
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

//checks if new email is already in users database
const hasEmailAlready = (email) => {
  for (const userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return null
};

//checks if user is logged in
const userLoggedIn = () => {
  if (req.cookies.user_id) {
    return true;
  }
  return false;
};


// ______________________POST_________________________________________


app.post('/login', (req, res) => {
  let databaseUser = getUserByEmail(req.body.email, users);

  if (!hasEmailAlready(req.body.email)) {
    return res.status(403).send('email not found, sorry');
  }
  
  const passwordMatches = bcrypt.compareSync(req.body.password, users[databaseUser.id].password);
  
  if (!passwordMatches) {
    console.log(req.body.password);
    return res.status(403).send('password does not match');
  }

  req.session.user_id = hasEmailAlready(req.body.email);

  res.redirect('/urls');
});


app.post('/register', (req, res) => {
  const randomUserID = generateRandomString();
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);

  //checks if email is in users database already  
  const emailIsTaken = (email) => {
    for (const user in users) {
      if (users[user].email === email) {
        return true;
      } 
    }
  };

  users[randomUserID] = {
    id: randomUserID,
    email: req.body.email,
    password: hashedPassword,
  };

  if (req.body.email === "" || req.body.password === "") {
     return res.status(400).send('email or pass cannot be empty');
  } else if (emailIsTaken(req.body.email)) {
    return res.status(400).send('email is taken already, sorry');
  }

  req.session.user_id = users[randomUserID];
  res.redirect('/urls');
});


app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

app.post('/urls/:id/delete', (req, res) => {
  const urlLinkOwnerId = urlDatabase[req.params.id]["userID"];
  const userSessionId = req.session.user_id.id;
  const userOwnsUrl = urlLinkOwnerId === userSessionId;

  //gets shortURL link matching target link parameter
  const databaseLinkKey = (paramsID) => {
    for (linkItem in urlDatabase) {
      if (linkItem === paramsID) {
        return linkItem;
      }
    }
  };

  if (!userLoggedIn) {
    return res.send('you are not the logged in user, cannot delete');
  }  
  
  if (!userOwnsUrl) {
    return res.send('you are not the owner of the URL, cannot delete');
  } else {
    delete urlDatabase[databaseLinkKey(req.params.id)];
  }

  res.redirect('/urls');
});



app.post('/urls/:id', (req, res) => {
  const userHasUrl = urlDatabase[req.params.id].userID === req.session.user_id.id
  
  if (!req.session.user_id.id) {
    return res.send('you are not the logged in user to the URL, cannot make new URL');
  } else if (!urlDatabase[req.params.id].userID) {
    return res.send('url userID not found');
  } else if (!userHasUrl) {
    return res.send('you are not the owner of the URL, cannot post');
  }

  urlDatabase[req.params.id] = {
    longURL: req.body.longURL,
    userID: req.session.user_id.id
  };

  res.redirect('/urls');
});


app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();

  if (!req.session.user_id) {
    return res.send('you must login to wield the power of shortened links');
  }

  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id.id
  };

  res.redirect(`/urls/${shortURL}`);
});


//_______________________GET______________________________

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
  
  if (!req.session.user_id) {
    return res.send("You must log in to access this page.");
  }
  if (!urlDatabase[req.params.id]) {
    return res.send("URL not found.");
  }
  if (urlDatabase[req.params.id].userID !== req.session.user_id.id) {
    return res.send("This is not the URL that you created :(");
  }
  
  const templateVars = {
    user: req.session.user_id,
    longURL: urlDatabase[req.params.id].longURL,
    id: req.params.id,
    urls: urlDatabase,
  };

  res.render("urls_show", templateVars);
  
});


app.get('/u/:id', (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id] ? urlDatabase[id].longURL : null;
  
  if (!longURL) {
    return res.send("URL not found.");
  }
  res.redirect(longURL);
});


app.get('/urls', (req, res) => {
  const urlsForUser = (id) => {
    const filteredUrls = {};

    for (urlId in urlDatabase) {
      if (urlDatabase[urlId].userID === id) {
        filteredUrls[urlId] = urlDatabase[urlId];
      }
    } 
    return filteredUrls;
  };
  
  if (!req.session.user_id) {
    return res.send('you must login first to see these links');
  }

  const templateVars = { 
    urls: urlsForUser(req.session.user_id.id),
    user: req.session.user_id
  };  

  res.render('urls_index', templateVars);
});


app.get('/', (req, res) => {
  if (!userLoggedIn) {
    res.redirect('/login');
  } else {
    res.redirect('/urls');
  }
});

app.listen(PORT, () => {
  console.log(`example app listening on port ${PORT}`);
  console.log('FOLLOW THE WHITE RABBIT');
});