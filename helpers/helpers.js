const createNewUser = (userDatabase, userObject) => {
  const { id } = userObject;
  if (!userDatabase[id]) {
    userDatabase[id] = userObject
    return userObject
  }
  return null
}

const findUser = (userDatabase, email) => {
  for (let user in userDatabase) {
    if (userDatabase[user].email === email) {
      return userDatabase[user]
    }
  }
  return false
}

// const checkLogin = (userDatabase, email, password) => {
//   // const user = userDatabase[email] ? userDatabase[email] : {}
//   for (let user in userDatabase) {
//     if (userDatabase[user].email === email && userDatabase[user].password === password) {
//       return userDatabase[user]
//     }
//   }
//   return false
// }

const urlsForUser = (urlDatabase, id) => {
  let urlObjects = {}
  for (let urls in urlDatabase) {
    if (urlDatabase[urls].userID === id) {
      urlObjects[urls] = urlDatabase[urls]
    }
  }
  return urlObjects
}

module.exports = { createNewUser, findUser, urlsForUser }

