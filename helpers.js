const getUserByEmail = function(email, database) {
  for (userAccount in database) {
    if (database[userAccount].email === email) {
      return database[userAccount]
    }
  }
  return null
}

module.exports = getUserByEmail