
//return user obj from email param by finding match in users database
const getUserByEmail = function(email, database) {
  for (userAccount in database) {
    if (database[userAccount].email === email) {
      return database[userAccount]
    }
  }
  return null
}

//generates random string of 6 chars from alphanumeric charset for link's short URL
function generateRandomString() {
  const charset = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let randomString = '';

  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    randomString += charset[randomIndex];
  }

  return randomString;
};

//checks if user is logged in by checking cookie's user obj
const userLoggedIn = () => {
  if (req.cookies.user_id) {
    return true;
  }
  return false;
};


module.exports = { getUserByEmail, generateRandomString, userLoggedIn };