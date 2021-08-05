const createNewUser = (userDatabase, userObject) => {
  const { id } = userObject;
  if (!userDatabase[id]) {
    userDatabase[id] = userObject
    return userObject
  }
  return null
}

const findUser = (userDatabase, email) => {
  // const user = userDatabase[email] ? userDatabase[email] : {}
  for (let user in userDatabase) {
    if (userDatabase[user].email === email) {
      return userDatabase[user]
    }
  }
  return false
}

const findUser2 = (userDatabase, email, password) => {
  // const user = userDatabase[email] ? userDatabase[email] : {}
  for (let user in userDatabase) {
    if (userDatabase[user].email === email && userDatabase[user].password === password) {
      return userDatabase[user]
    }
  }
  return false
}

module.exports = { createNewUser, findUser, findUser2 }